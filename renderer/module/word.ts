//

import {
  v1 as uuid
} from "uuid";
import {
  ParsedWord
} from "./parsed-word";
import {
  MarkupResolvers,
  Parser
} from "./parser";


export class Word {

  public uid!: string;
  public name: string;
  public date: number;
  public equivalentNames!: EquivalentNames;
  public contents: Contents;

  public constructor(name: string, date: number, contents: Contents) {
    this.name = name;
    this.date = date;
    this.contents = contents;
    this.updateUid();
    this.updateEquivalentNames();
  }

  public static fromPlain(plain: Word): Word {
    let name = plain.name;
    let date = plain.date;
    let contents = plain.contents;
    let word = new Word(name, date, contents);
    return word;
  }

  public static fromString(string: string): Word {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\s*(.+?)\s*@(\d+)/)
    if (match) {
      let name = match[1];
      let date = parseInt(match[2], 10);
      let contents = {} as Contents;
      let before = true;
      let currentLanguage = "";
      let currentContent = "";
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        let languageMatch = line.match(/^!(\w{2})/);
        if (languageMatch) {
          if (!before) {
            contents[currentLanguage] = currentContent.trim();
          }
          before = false;
          currentLanguage = languageMatch[1].toLowerCase();
          currentContent = "";
        } else {
          currentContent += line + "\n";
        }
      }
      if (!before) {
        contents[currentLanguage] = currentContent.trim();
      }
      let word = new Word(name, date, contents);
      return word;
    } else {
      throw new Error("parse failed");
    }
  }

  public static createEmpty(): Word {
    let name = "";
    let date = 0;
    let contents = {};
    let word = new Word(name, date, contents);
    return word;
  }

  public edit(word: Word): void {
    this.name = word.name;
    this.date = word.date;
    this.contents = word.contents;
    this.updateEquivalentNames();
  }

  private updateUid(): void {
    this.uid = uuid();
  }

  private updateEquivalentNames(): void {
    let equivalentNames = {} as EquivalentNames;
    for (let [language, content] of Object.entries(this.contents)) {
      let eachEquivalentNames = [];
      if (content !== undefined) {
        let match;
        if (match = content.match(/^=(\?)?\s*(?:<(.*?)>\s*)?(?:\((.*?)\)\s*)?(.*)$/m)) {
          eachEquivalentNames.push(...match[4].split(/\s*,\s*/));
        }
        if (match = content.match(/^(P)(\?)?:\s*(?:@(\d+)\s*)?(.*?)\s*→\s*(.*?)(?:\s*\|\s*(.*))?$/m)) {
          eachEquivalentNames.push(...match[5].split(/\s*,\s*/));
        }
        equivalentNames[language] = eachEquivalentNames;
      }
    }
    this.equivalentNames = equivalentNames;
  }

  public parse<S, E>(resolvers: MarkupResolvers<S, E>): ParsedWord<S> {
    let parser = new Parser(resolvers);
    let parsedWord = parser.parse(this);
    return parsedWord;
  }

}


export type EquivalentNames = {[language: string]: Array<string> | undefined};
export type Contents = {[language: string]: string | undefined};