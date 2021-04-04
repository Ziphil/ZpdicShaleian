//

import {
  v1 as uuid
} from "uuid";
import {
  Dictionary
} from "./dictionary";
import {
  ValidationError
} from "./error";
import {
  ParsedWord
} from "./parsed-word";
import {
  MarkupResolvers,
  Parser
} from "./parser";


export class Word implements PlainWord {

  private dictionary: Dictionary | null = null;
  public uid: string;
  public name!: string;
  public uniqueName: string;
  public date: number;
  public equivalentNames!: EquivalentNames;
  public contents: Contents;
  public comparisonString!: string;

  public constructor(uniqueName: string, date: number, contents: Contents) {
    this.uid = uuid();
    this.uniqueName = uniqueName;
    this.date = date;
    this.contents = contents;
    this.update();
  }

  public static createEmpty(): Word {
    let name = "";
    let rawDate = new Date();
    let date = Math.floor((rawDate.getTime() - 1327179600000) / 86400000);
    let contents = {ja: "+ <>\n= <>\n\nM:"};
    let word = new Word(name, date, contents);
    return word;
  }

  public static fromPlain(plain: PlainWord): Word {
    let uniqueName = plain.uniqueName;
    let date = plain.date;
    let contents = plain.contents;
    let word = new Word(uniqueName, date, contents);
    return word;
  }

  public toPlain(): PlainWord {
    let uid = this.uid;
    let uniqueName = this.uniqueName;
    let date = this.date;
    let contents = this.contents;
    return {uid, uniqueName, date, contents};
  }

  public toParsed<S, E>(resolvers: MarkupResolvers<S, E>): ParsedWord<S> {
    let parser = new Parser(resolvers);
    let parsedWord = parser.parse(this);
    return parsedWord;
  }

  public setDictionary(dictionary: Dictionary): void {
    this.dictionary = dictionary;
    this.updateComparisonString();
  }

  public edit(word: PlainWord, skipValidate?: boolean): void {
    let errorType = (skipValidate) ? null : this.validateEdit(word);
    if (errorType === null) {
      this.uniqueName = word.uniqueName;
      this.date = word.date;
      this.contents = Object.fromEntries(Object.entries(word.contents).map(([language, content]) => [language, content?.trim()]));
      this.update();
    } else {
      throw new ValidationError(errorType);
    }
  }

  public validateEdit(word: PlainWord): string | null {
    if (!Word.isValidUniqueName(word.uniqueName)) {
      return "invalidUniqueName";
    } else {
      return null;
    }
  }

  public update(): void {
    this.updateName();
    this.updateEquivalentNames();
    this.updateComparisonString();
  }

  private updateName(): void {
    let name = this.uniqueName.replaceAll("~", "");
    this.name = name;
  }

  private updateEquivalentNames(): void {
    let equivalentNames = {} as EquivalentNames;
    for (let [language, content] of Object.entries(this.contents)) {
      let eachEquivalentNames = [];
      if (content !== undefined) {
        let equivalentRegexp = /^=(\?)?\s*(?:<(.*?)>\s*)?(?:\((.*?)\)\s*)?(.*)$/mg;
        let phraseRegexp = /^(P)(\?)?:\s*(?:@(\d+)\s*)?(.*?)\s*→\s*(.*?)(?:\s*\|\s*(.*))?$/mg;
        let match;
        while (match = equivalentRegexp.exec(content)) {
          eachEquivalentNames.push(...match[4].split(/\s*,\s*/));
        }
        while (match = phraseRegexp.exec(content)) {
          eachEquivalentNames.push(...match[5].split(/\s*,\s*/));
        }
        equivalentNames[language] = eachEquivalentNames;
      }
    }
    this.equivalentNames = equivalentNames;
  }

  private updateComparisonString(): void {
    let comparisonString = "";
    let alphabetRule = this.dictionary?.settings.alphabetRule;
    if (alphabetRule !== undefined) {
      let apostrophe = alphabetRule.includes("'");
      for (let i = 0 ; i < this.uniqueName.length ; i ++) {
        let char = this.uniqueName.charAt(i);
        if ((apostrophe || char !== "'") && char !== "-" && char !== "+" && char !== "~") {
          let position = alphabetRule.indexOf(char);
          if (position >= 0) {
            comparisonString += String.fromCodePoint(position + 200);
          } else {
            comparisonString += String.fromCodePoint(1000);
          }
        }
      }
      let match = this.uniqueName.match(/^(\+)?(')?(.+?)(')?(\+)?(~*)$/);
      if (match) {
        if (match[2]) {
          comparisonString += String.fromCodePoint(150);
        }
        if (match[4]) {
          comparisonString += String.fromCodePoint(151);
        }
        if (match[1]) {
          comparisonString += String.fromCodePoint(160);
        }
        if (match[5]) {
          comparisonString += String.fromCodePoint(161);
        }
        if (match[6].length > 0) {
          comparisonString += String.fromCodePoint(match[6].length + 100);
        }
      } else {
        throw new Error("cannot happen");
      }
      this.comparisonString = comparisonString;
    } else {
      this.comparisonString = "";
    }
  }

  public getFileName(): string {
    let match = this.uniqueName.match(/^(\+)?(.+?)(\+)?(~*)$/);
    if (match) {
      let modifier = "";
      if (match[1]) {
        modifier += "S";
      }
      if (match[3]) {
        modifier += "P";
      }
      if (match[4].length > 0) {
        modifier += (match[4].length + 1).toString();
      }
      if (modifier.length > 0) {
        modifier = "_" + modifier;
      }
      let fileName = match[2] + modifier;
      return fileName;
    } else {
      throw new Error("cannot happen");
    }
  }

  public static sortWords(words: Array<Word>): Array<Word> {
    let sortedWords = words.sort((firstWord, secondWord) => {
      let firstComparisonString = firstWord.comparisonString;
      let secondComparisonString = secondWord.comparisonString;
      if (firstComparisonString < secondComparisonString) {
        return -1;
      } else if (firstComparisonString > secondComparisonString) {
        return 1;
      } else {
        return 0;
      }
    });
    return sortedWords;
  }

  public static isValidUniqueName(uniqueName: string): boolean {
    return uniqueName.match(/^(\+)?((?:\p{L}|-|')+?)(\+)?(~*)$/u) !== null;
  }

}


export interface PlainWord {

  uid: string;
  uniqueName: string;
  date: number;
  contents: Contents;

}


export type EquivalentNames = {[language: string]: Array<string> | undefined};
export type Contents = {[language: string]: string | undefined};