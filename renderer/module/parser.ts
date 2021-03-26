//

import {
  Word
} from "./word";
import {
  ParsedWord
} from "./parsed-word";
import {
  Part
} from "./part";
import {
  Section
} from "./section";
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
  Relation
} from "./relation";


export class Parser<S, E> {

  private readonly markupParser: MarkupParser<S, E>;

  public constructor(reducers: MarkupReducers<S, E>) {
    this.markupParser = new MarkupParser(reducers);
  }

  public parse(word: Word): ParsedWord<S> {
    let name = word.name;
    let date = word.date;
    let parts = new Map<string, Part<S>>();
    for (let [language, content] of word.contents) {
      let part = this.parsePart(content);
      parts.set(language, part);
    }
    let parsedWord = new ParsedWord(name, date, parts);
    return parsedWord;
  }

  private parsePart(content: string): Part<S> {
    let lines = content.split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\+\s*<(.+?)>/);
    let lexicalCategory = (match !== null) ? match[1] : "";
    let firstIndex = (match !== null) ? 1 : 0;
    let sections = []
    let currentEquivalents = [];
    let currentInformations = [];
    let currentRelations = [];
    for (let i = firstIndex ; i < lines.length ; i ++) {
      let line = lines[i];
      let equivalenceMatch = line.match(/^=/)
      if (equivalenceMatch) {
        let section = new Section(currentEquivalents, currentInformations, currentRelations);
        sections.push(section);
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
    let section = new Section(currentEquivalents, currentInformations, currentRelations);
    sections.push(section);
    let part = new Part(lexicalCategory, sections);
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
    let match = line.match(/^=(\?)?\s*<(.+?)>\s*(?:\((.+?)\)\s*)?(.+)$/)
    if (match) {
      let hidden = match[1] !== undefined;
      let category = match[2];
      let frame = this.markupParser.parse(match[3] ?? "");
      let names = match[4].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
      let equivalent = new Equivalent(category, frame, names, hidden);
      return equivalent;
    } else {
      return null;
    }
  }

  private parseInformation(line: string): Information<S> | null {
    let match = line.match(/^(\w)(\?)?:\s*(?:@(\d+)\s*)?(.+)$/);
    if (match) {
      let kind = InformationKindUtil.fromCode(match[1]);
      let hidden = match[2] !== undefined;
      let date = (match[3] !== undefined) ? parseInt(match[3], 10) : null;
      let rawText = match[4];
      if (kind === "phrase") {
        let textMatch = rawText.match(/^(.+?)\s*→\s*(.+?)(?:\s*\|\s*(.+))?$/)
        if (textMatch) {
          let expression = this.markupParser.parse(textMatch[1]);
          let equivalents = textMatch[2].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
          let phraseText = (textMatch[3] !== undefined) ? this.markupParser.parse(textMatch[3]) : null;
          let information = new PhraseInformation(expression, equivalents, phraseText, date, hidden);
          return information;
        } else {
          return null;
        }
      } else if (kind === "example") {
        let textMatch = rawText.match(/^(.+?)\s*→\s*(.+?)$/);
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
    let match = line.match(/^\-\s*<(.+?)>\s*(.+)$/)
    if (match) {
      let title = match[1];
      let names = match[2].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
      let relation = new Relation(title, names);
      return relation;
    } else {
      return null;
    }
  }

}


export class MarkupParser<S, E> {

  private readonly reducers: MarkupReducers<S, E>;
  private source: string = "";
  private pointer: number = 0;

  public constructor(reducers: MarkupReducers<S, E>) {
    this.reducers = reducers;
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
    let node = this.reducers.join(children);
    return node;
  }

  private consumeBrace(): E {
    this.pointer ++;
    let children = this.consumeBraceChildren();
    let element = this.reducers.reduceBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeBracket(): E {
    this.pointer ++;
    let children = this.consumeBracketChildren()
    let element = this.reducers.reduceBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeSlash(): [string, E] {
    this.pointer ++;
    let string = this.consumeSlashString();
    let element = this.reducers.reduceSlash(string);
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
          children.push(this.reducers.reduceLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        this.pointer ++;
        children.push(char);
      } else if (char === "}") {
        if (currentChildren.length > 0) {
          children.push(this.reducers.reduceLink(currentName, currentChildren));
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
    let string = ""
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "{" || char === "[" || char === "/" || char === "") {
        break;
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeBraceString(): string {
    let string = ""
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "}" || char === "/" || char === "" || char === " " || char === "," || char === "." || char === "!" || char === "?") {
        break;
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeBracketString(): string {
    let string = ""
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "]" || char === "/" || char === "") {
        break;
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeSlashString(): string {
    let string = ""
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "/" || char === "") {
        break;
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

}


export class MarkupReducers<S, E> {

  public readonly reduceLink: LinkReducer<E>;
  public readonly reduceBracket: BracketReducer<E>;
  public readonly reduceSlash: SlashReducer<E>;
  public readonly join: Joiner<S, E>;

  public constructor(reduceLink: LinkReducer<E>, reduceBracket: BracketReducer<E>, reduceSlash: SlashReducer<E>, join: Joiner<S, E>) {
    this.reduceLink = reduceLink;
    this.reduceBracket = reduceBracket;
    this.reduceSlash = reduceSlash;
    this.join = join;
  }

}


type LinkReducer<E> = (name: string, children: Array<E | string>) => E;
type BracketReducer<E> = (children: Array<E | string>) => E;
type SlashReducer<E> = (string: string) => E;
type Joiner<S, E> = (nodes: Array<E | string>) => S;