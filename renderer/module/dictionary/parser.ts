//

import {
  Equivalent
} from "./equivalent";
import {
  ExampleInformation,
  Information,
  NormalInformation,
  PhraseInformation
} from "./information";
import {
  InformationKindUtil
} from "./information-kind";
import {
  ParsedWord,
  Parts
} from "./parsed-word";
import {
  Part
} from "./part";
import {
  Relation
} from "./relation";
import {
  Section
} from "./section";
import {
  Word
} from "./word";


export class Parser<S, E> {

  private readonly markupParser: MarkupParser<S, E>;

  public constructor(resolvers: MarkupResolvers<S, E>) {
    this.markupParser = new MarkupParser(resolvers);
  }

  public parse(word: Word): ParsedWord<S> {
    let name = word.name;
    let date = word.date;
    let parts = {} as Parts<S>;
    for (let [language, content] of Object.entries(word.contents)) {
      if (content !== undefined) {
        let part = this.parsePart(content);
        parts[language] = part;
      }
    }
    let parsedWord = new ParsedWord(name, date, parts);
    return parsedWord;
  }

  private parsePart(content: string): Part<S> {
    let lines = content.split(/\r\n|\r|\n/);
    let sections = [];
    let before = true;
    let currentLexicalCategory = null as string | null;
    let currentEquivalents = [];
    let currentInformations = [];
    let currentRelations = [];
    for (let line of lines) {
      let lexicalCategoryMatch = line.match(/^\+\s*(?:<(.*?)>)/);
      if (lexicalCategoryMatch) {
        if (!before) {
          let section = new Section(currentLexicalCategory, currentEquivalents, currentInformations, currentRelations);
          sections.push(section);
        }
        before = false;
        currentLexicalCategory = lexicalCategoryMatch[1] || null;
        currentEquivalents = [];
        currentInformations = [];
        currentRelations = [];
      }
      let lineData = this.parseLineData(line);
      if (lineData instanceof Equivalent) {
        currentEquivalents.push(lineData);
      } else if (lineData instanceof Relation) {
        currentRelations.push(lineData);
      } else if (lineData !== null) {
        currentInformations.push(lineData);
      }
    }
    if (!before) {
      let section = new Section(currentLexicalCategory, currentEquivalents, currentInformations, currentRelations);
      sections.push(section);
    }
    let part = new Part(sections);
    return part;
  }

  private parseLineData(line: string): Equivalent<S> | Information<S> | Relation<S> | null {
    if (line.match(/^=/)) {
      return this.parseEquivalent(line);
    } else if (line.match(/^\w:/)) {
      return this.parseInformation(line);
    } else if (line.match(/^\-/)) {
      return this.parseRelation(line);
    } else {
      return null;
    }
  }

  private parseEquivalent(line: string): Equivalent<S> | null {
    let match = line.match(/^=(\?)?\s*(?:<(.*?)>\s*)?(?:\((.*?)\)\s*)?(.*)$/);
    if (match) {
      let hidden = match[1] !== undefined;
      let category = (match[2] !== undefined && match[2] !== "") ? match[2] : null;
      let frame = (match[3] !== undefined && match[3] !== "") ? this.markupParser.parse(match[3]) : null;
      let names = match[4].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
      let equivalent = new Equivalent(category, frame, names, hidden);
      return equivalent;
    } else {
      return null;
    }
  }

  private parseInformation(line: string): Information<S> | null {
    let match = line.match(/^(\w)(\?)?:\s*(?:@(\d+)\s*)?(.*)$/);
    if (match) {
      let kind = InformationKindUtil.fromCode(match[1]);
      let hidden = match[2] !== undefined;
      let date = (match[3] !== undefined) ? parseInt(match[3], 10) : null;
      let rawText = match[4];
      if (kind === "phrase") {
        let textMatch = rawText.match(/^(.*?)\s*→\s*(.*?)(?:\s*\|\s*(.*))?$/);
        if (textMatch) {
          let expression = this.markupParser.parse(textMatch[1]);
          let equivalents = textMatch[2].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
          let text = (textMatch[3] !== undefined && textMatch[3] !== "") ? this.markupParser.parse(textMatch[3]) : null;
          let information = new PhraseInformation(expression, equivalents, text, date, hidden);
          return information;
        } else {
          return null;
        }
      } else if (kind === "example") {
        let textMatch = rawText.match(/^(.*?)\s*→\s*(.*?)$/);
        if (textMatch) {
          let sentence = this.markupParser.parse(textMatch[1]);
          let translation = this.markupParser.parse(textMatch[2]);
          let information = new ExampleInformation(sentence, translation, date, hidden);
          return information;
        } else {
          return null;
        }
      } else if (kind !== undefined) {
        let text = this.markupParser.parse(rawText);
        let information = new NormalInformation(kind, text, date, hidden);
        return information;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private parseRelation(line: string): Relation<S> | null {
    let match = line.match(/^\-\s*(?:<(.*?)>\s*)?(.*)$/);
    if (match) {
      let title = (match[1] !== undefined && match[1] !== "") ? match[1] : null;
      let names = match[2].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
      let relation = new Relation(title, names);
      return relation;
    } else {
      return null;
    }
  }

}


export class MarkupParser<S, E> {

  private readonly resolvers: MarkupResolvers<S, E>;
  private source: string = "";
  private pointer: number = 0;

  public constructor(resolvers: MarkupResolvers<S, E>) {
    this.resolvers = resolvers;
  }

  public parse(source: string): S {
    this.source = source;
    this.pointer = 0;
    let node = this.consume();
    return node;
  }

  public consume(): S {
    let children = [];
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "{") {
        let element = this.consumeBrace();
        children.push(element);
      } else if (char === "[") {
        let element = this.consumeBracket();
        children.push(element);
      } else if (char === "/") {
        let element = this.consumeSlash()[1];
        children.push(element);
      } else if (char === "") {
        break;
      } else {
        let string = this.consumeString();
        children.push(string);
      }
    }
    let node = this.resolvers.join(children);
    return node;
  }

  private consumeBrace(): E {
    this.pointer ++;
    let children = this.consumeBraceChildren();
    let element = this.resolvers.resolveBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeBracket(): E {
    this.pointer ++;
    let children = this.consumeBracketChildren();
    let element = this.resolvers.resolveBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeSlash(): [string, E] {
    this.pointer ++;
    let string = this.consumeSlashString();
    let element = this.resolvers.resolveSlash(string);
    this.pointer ++;
    return [string, element];
  }

  private consumeBraceChildren(): Array<E | string> {
    let children = [];
    let currentChildren = [];
    let currentName = "";
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === " " || char === "," || char === "." || char === "!" || char === "?") {
        if (currentChildren.length > 0) {
          children.push(this.resolvers.resolveLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        this.pointer ++;
        children.push(char);
      } else if (char === "}") {
        if (currentChildren.length > 0) {
          children.push(this.resolvers.resolveLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        break;
      } else if (char === "/") {
        let [slashName, slashElement] = this.consumeSlash();
        currentChildren.push(slashElement);
        currentName += slashName;
      } else {
        let string = this.consumeBraceString();
        currentChildren.push(string);
        currentName += string;
      }
    }
    return children;
  }

  private consumeBracketChildren(): Array<E | string> {
    let children = [];
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "/") {
        let [, slashElement] = this.consumeSlash();
        children.push(slashElement);
      } else if (char === "]") {
        break;
      } else {
        let string = this.consumeBracketString();
        children.push(string);
      }
    }
    return children;
  }

  private consumeString(): string {
    let string = "";
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "{" || char === "[" || char === "/" || char === "") {
        break;
      } else if (char === "`") {
        string += this.consumeEsacpe();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeBraceString(): string {
    let string = "";
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "}" || char === "/" || char === "" || char === " " || char === "," || char === "." || char === "!" || char === "?") {
        break;
      } else if (char === "`") {
        string += this.consumeEsacpe();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeBracketString(): string {
    let string = "";
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "]" || char === "/" || char === "") {
        break;
      } else if (char === "`") {
        string += this.consumeEsacpe();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeSlashString(): string {
    let string = "";
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "/" || char === "") {
        break;
      } else if (char === "`") {
        string += this.consumeEsacpe();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeEsacpe(): string {
    this.pointer ++;
    let char = this.source.charAt(this.pointer ++);
    return char;
  }

}


export class MarkupResolvers<S, E> {

  public readonly resolveLink: LinkResolver<E>;
  public readonly resolveBracket: BracketResolver<E>;
  public readonly resolveSlash: SlashResolver<E>;
  public readonly join: Joiner<S, E>;

  public constructor(reduceLink: LinkResolver<E>, reduceBracket: BracketResolver<E>, reduceSlash: SlashResolver<E>, join: Joiner<S, E>) {
    this.resolveLink = reduceLink;
    this.resolveBracket = reduceBracket;
    this.resolveSlash = reduceSlash;
    this.join = join;
  }

  public static createSimple(): MarkupResolvers<string, string> {
    let reduceLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    let reduceBracket = function (children: Array<string>): string {
      return children.join("");
    };
    let reduceSlash = function (string: string): string {
      return string;
    };
    let join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    let resolvers = new MarkupResolvers(reduceLink, reduceBracket, reduceSlash, join);
    return resolvers;
  }

}


type LinkResolver<E> = (name: string, children: Array<E | string>) => E;
type BracketResolver<E> = (children: Array<E | string>) => E;
type SlashResolver<E> = (string: string) => E;
type Joiner<S, E> = (nodes: Array<E | string>) => S;