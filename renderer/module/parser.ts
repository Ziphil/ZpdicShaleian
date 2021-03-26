//

import {
  Word
} from "./word";
import {
  ParsedWord
} from "./parsed-word";


export class Parser<S, E> {

  private readonly word: Word;
  private readonly markupParser: MarkupParser<S, E>;

  public constructor(word: Word, reducers: MarkupReducers<S, E>) {
    this.word = word;
    this.markupParser = new MarkupParser("", reducers);
  }

}


export class MarkupParser<S, E> {

  private source: string;
  private pointer: number;
  private readonly reducers: MarkupReducers<S, E>;

  public constructor(source: string, reducers: MarkupReducers<S, E>) {
    this.source = source;
    this.pointer = 0;
    this.reducers = reducers;
  }

  public update(source: string): void {
    this.source = source;
    this.pointer = 0;
  }

  public parse(): S {
    let children = [];
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "{") {
        let element = this.parseBrace();
        children.push(element);
      } else if (char === "[") {
        let element = this.parseBracket();
        children.push(element);
      } else if (char === "/") {
        let element = this.parseSlash()[1];
        children.push(element);
      } else if (char === "") {
        break;
      } else {
        let string = this.parseString();
        children.push(string);
      }
    }
    let node = this.reducers.join(children);
    return node;
  }

  private parseBrace(): E {
    this.pointer ++;
    let children = this.parseBraceChildren();
    let element = this.reducers.reduceBracket(children);
    this.pointer ++;
    return element;
  }

  private parseBracket(): E {
    this.pointer ++;
    let children = this.parseBracketChildren()
    let element = this.reducers.reduceBracket(children);
    this.pointer ++;
    return element;
  }

  private parseSlash(): [string, E] {
    this.pointer ++;
    let string = this.parseSlashString();
    let element = this.reducers.reduceSlash(string);
    this.pointer ++;
    return [string, element];
  }

  private parseBraceChildren(): Array<E | string> {
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
        let [slashName, slashElement] = this.parseSlash();
        currentChildren.push(slashElement);
        currentName += slashName;
      } else {
        let string = this.parseBraceString();
        currentChildren.push(string);
        currentName += string;
      }
    }
    return children;
  }

  private parseBracketChildren(): Array<E | string> {
    let children = [];
    while (true) {
      let char = this.source.charAt(this.pointer);
      if (char === "/") {
        let [, slashElement] = this.parseSlash();
        children.push(slashElement);
      } else if (char === "]") {
        break;
      } else {
        let string = this.parseBracketString();
        children.push(string);
      }
    }
    return children;
  }

  private parseString(): string {
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

  private parseBraceString(): string {
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

  private parseBracketString(): string {
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

  private parseSlashString(): string {
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