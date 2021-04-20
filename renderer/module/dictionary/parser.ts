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
} from "./information";
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


export class Parser<S> {

  private readonly markupParser: MarkupParser<S, unknown>;

  public constructor(resolver: MarkupResolver<S, any>) {
    this.markupParser = new MarkupParser(resolver);
  }

  public static createSimple(): Parser<string> {
    let resolver = MarkupResolver.createSimple();
    let parser = new Parser(resolver);
    return parser;
  }

  public static createKeep(): Parser<string> {
    let resolver = MarkupResolver.createKeep();
    let parser = new Parser(resolver);
    return parser;
  }

  // 与えられた単語データをパースして、ParsedWord オブジェクトとして返します。
  // パースした全てのデータではなく一部の項目の内容のみが必要な場合は、lookup から始まるメソッドを使用した方が軽量です。
  public parse(word: Word): ParsedWord<S> {
    let name = word.name;
    let uniqueName = word.uniqueName;
    let date = word.date;
    let parts = {} as Parts<S>;
    for (let [language, content] of Object.entries(word.contents)) {
      if (content !== undefined) {
        let part = this.parsePart(content);
        parts[language] = part;
      }
    }
    let parsedWord = new ParsedWord(name, uniqueName, date, parts);
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
      let field = this.parseField(line);
      if (field !== null) {
        if (field instanceof Equivalent) {
          currentEquivalents.push(field);
        } else if (field instanceof Information) {
          currentInformations.push(field);
        } else if (field instanceof Relation) {
          currentRelations.push(field);
        }
      }
    }
    if (!before) {
      let section = new Section(currentLexicalCategory, currentEquivalents, currentInformations, currentRelations);
      sections.push(section);
    }
    let part = new Part(sections);
    return part;
  }

  private parseField(line: string): Equivalent<S> | Information<S> | Relation<S> | null {
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
      let entries = match[2].split(/\s*,\s*/).map((rawName) => {
        if (rawName.endsWith("*")) {
          let name = this.markupParser.parse(rawName.substring(0, rawName.length - 1));
          return {name, refer: true};
        } else {
          let name = this.markupParser.parse(rawName);
          return {name, refer: false};
        }
      });
      let relation = new Relation(title, entries);
      return relation;
    } else {
      return null;
    }
  }

  public lookupLexicalCategory(word: Word, language: string): string | null | undefined {
    let content = word.contents[language];
    if (content !== undefined) {
      let match = content.match(/^\+\s*(?:<(.*?)>)/m);
      if (match) {
        return match[1];
      } else {
        return null;
      }
    } else {
      return undefined;
    }
  }

}


export class MarkupParser<S, E> {

  private readonly resolver: MarkupResolver<S, E>;
  private source: string = "";
  private pointer: number = 0;

  public constructor(resolver: MarkupResolver<S, E>) {
    this.resolver = resolver;
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
        let [, element] = this.consumeSlash();
        children.push(element);
      } else if (char === "") {
        break;
      } else {
        let string = this.consumeString();
        children.push(string);
      }
    }
    let node = this.resolver.join(children);
    return node;
  }

  private consumeBrace(): E {
    this.pointer ++;
    let children = this.consumeBraceChildren();
    let element = this.resolver.resolveBrace(children);
    this.pointer ++;
    return element;
  }

  private consumeBracket(): E {
    this.pointer ++;
    let children = this.consumeBracketChildren();
    let element = this.resolver.resolveBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeSlash(): [string, E] {
    this.pointer ++;
    let string = this.consumeSlashString();
    let element = this.resolver.resolveSlash(string);
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
          children.push(this.resolver.resolveLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        this.pointer ++;
        children.push(char);
      } else if (char === "}") {
        if (currentChildren.length > 0) {
          children.push(this.resolver.resolveLink(currentName, currentChildren));
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
    let char = this.resolver.resolveEscape(this.source.charAt(this.pointer ++));
    return char;
  }

}


export class MarkupResolver<S, E> {

  public readonly resolveLink: LinkResolver<E>;
  public readonly resolveBracket: BracketResolver<E>;
  public readonly resolveBrace: BracketResolver<E>;
  public readonly resolveSlash: SlashResolver<E>;
  public readonly resolveEscape: EscapeResolver;
  public readonly join: Joiner<S, E>;

  public constructor(spec: MarkupResolverSpec<S, E>) {
    this.resolveLink = spec.resolveLink;
    this.resolveBracket = spec.resolveBracket;
    this.resolveBrace = spec.resolveBrace ?? spec.resolveBracket;
    this.resolveSlash = spec.resolveSlash;
    this.resolveEscape = spec.resolveEscape ?? MarkupResolver.createNoopEscapeResolver();
    this.join = spec.join;
  }

  private static createNoopEscapeResolver(): EscapeResolver {
    let resolve = function (char: string): string {
      return char;
    };
    return resolve;
  }

  // マークアップを全て取り除いてプレーンテキストにするリゾルバを作成します。
  public static createSimple(): MarkupResolver<string, string> {
    let resolveLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    let resolveBracket = function (children: Array<string>): string {
      return children.join("");
    };
    let resolveSlash = function (string: string): string {
      return string;
    };
    let join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    let resolver = new MarkupResolver({resolveLink, resolveBracket, resolveSlash, join});
    return resolver;
  }

  // マークアップの特殊文字などをそのまま残すリゾルバを作成します。
  public static createKeep(): MarkupResolver<string, string> {
    let resolveLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    let resolveBracket = function (children: Array<string>): string {
      return "[" + children.join("") + "]";
    };
    let resolveBrace = function (children: Array<string>): string {
      return "{" + children.join("") + "}";
    };
    let resolveSlash = function (string: string): string {
      return "/" + string + "/";
    };
    let resolveEscape = function (char: string): string {
      return "`" + char;
    };
    let join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    let resolver = new MarkupResolver({resolveLink, resolveBracket, resolveBrace, resolveSlash, resolveEscape, join});
    return resolver;
  }

}


type MarkupResolverSpec<S, E> = {
  resolveLink: LinkResolver<E>,
  resolveBracket: BracketResolver<E>,
  resolveBrace?: BracketResolver<E>,
  resolveSlash: SlashResolver<E>,
  resolveEscape?: EscapeResolver,
  join: Joiner<S, E>
};

type LinkResolver<E> = (name: string, children: Array<E | string>) => E;
type BracketResolver<E> = (children: Array<E | string>) => E;
type SlashResolver<E> = (string: string) => E;
type EscapeResolver = (char: string) => string;
type Joiner<S, E> = (nodes: Array<E | string>) => S;