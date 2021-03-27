//

import {
  ParsedWord
} from "./parsed-word";
import {
  MarkupReducers,
  Parser
} from "./parser";


export class Word {

  public name: string;
  public date: number;
  public contents: Contents;

  public constructor(name: string, date: number, contents: Contents) {
    this.name = name;
    this.date = date;
    this.contents = contents;
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
      let currentLanguage = "";
      let currentContent = "";
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        let languageMatch = line.match(/^!(\w{2})/);
        if (languageMatch) {
          if (currentLanguage !== "" && currentContent.trim() !== "") {
            contents[currentLanguage] = currentContent.trim();
          }
          currentLanguage = languageMatch[1].toLowerCase();
          currentContent = "";
        } else {
          currentContent += line + "\n";
        }
      }
      if (currentContent.trim() !== "") {
        contents[currentLanguage] = currentContent.trim();
      }
      let word = new Word(name, date, contents);
      return word;
    } else {
      throw new Error("parse failed");
    }
  }

  public toParsed<S, E>(reducers: MarkupReducers<S, E>): ParsedWord<S> {
    let parser = new Parser(reducers);
    let parsedWord = parser.parse(this);
    return parsedWord;
  }

}


export type Contents = {[language: string]: string | undefined};