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
  Marker
} from "./marker";
import {
  Parser
} from "./parser";


export class Word implements PlainWord {

  public dictionary?: Dictionary;
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
    this.update(false);
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

  // この単語オブジェクトが属する辞書オブジェクトを設定します。
  // ローダーなどを通さずに手動で単語オブジェクトを生成した際は、必ずこのメソッドを使って辞書オブジェクトを設定してください。
  public setDictionary(dictionary: Dictionary): void {
    this.dictionary = dictionary;
    this.updateComparisonString();
  }

  public copy(): Word {
    this.ensureDictionary();
    let word = new Word(this.uniqueName, this.date, this.contents);
    word.setDictionary(this.dictionary);
    return word;
  }

  public edit(newWord: PlainWord, skipValidate?: boolean): void {
    let errorType = (skipValidate) ? null : this.validateEdit(newWord);
    if (errorType === null) {
      this.uniqueName = newWord.uniqueName;
      this.date = newWord.date;
      this.contents = Object.fromEntries(Object.entries(newWord.contents).map(([language, content]) => [language, content?.trim()]));
      this.update(true);
    } else {
      throw new ValidationError(errorType);
    }
  }

  public validateEdit(newWord: PlainWord): string | null {
    if (!Word.isValidUniqueName(newWord.uniqueName)) {
      return "invalidUniqueName";
    } else {
      return null;
    }
  }

  public get markers(): Array<Marker> {
    this.ensureDictionary();
    let markers = this.dictionary.markers.get(this.uniqueName);
    return markers;
  }

  public toggleMarker(marker: Marker): void {
    this.ensureDictionary();
    this.dictionary.markers.toggle(this.uniqueName, marker);
  }

  private update(full: boolean): void {
    this.updateName();
    this.updateEquivalentNames();
    if (full) {
      this.updateComparisonString();
    }
  }

  private updateName(): void {
    let name = this.uniqueName.replaceAll("~", "");
    this.name = name;
  }

  private updateEquivalentNames(): void {
    let equivalentNames = {} as EquivalentNames;
    let parser = Parser.createSimple();
    for (let [language] of Object.entries(this.contents)) {
      equivalentNames[language] = [...(parser.lookupEquivalentNames(this, language) ?? []), ...(parser.lookupPhraseEquivalentNames(this, language) ?? [])];
    }
    this.equivalentNames = equivalentNames;
  }

  private updateComparisonString(): void {
    this.ensureDictionary();
    let comparisonString = "";
    let alphabetRule = this.dictionary.settings.alphabetRule;
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
  }

  private ensureDictionary(): asserts this is Word & {dictionary: Dictionary} {
    if (!this.dictionary) {
      throw new Error("no dictionary set");
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