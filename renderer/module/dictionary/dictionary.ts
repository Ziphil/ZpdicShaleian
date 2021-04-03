//

import {
  DictionarySettings,
  PlainDictionarySettings
} from "./dictionary-settings";
import {
  ValidationError
} from "./error";
import {
  Marker,
  Markers
} from "./marker";
import {
  PlainWord,
  Word
} from "./word";
import {
  WordParameter
} from "./word-parameter/word-parameter";


export class Dictionary implements PlainDictionary {

  public words: Array<Word>;
  public settings: DictionarySettings;
  public markers: Markers;
  public path: string | null;

  public constructor(words: Array<Word>, settings: DictionarySettings, markers: Markers, path: string | null) {
    this.words = words;
    this.settings = settings;
    this.markers = markers;
    this.path = path;
    for (let word of words) {
      word.setDictionary(this);
    }
  }

  public static fromPlain(plain: PlainDictionary): Dictionary {
    let words = plain.words.map((plainWord) => Word.fromPlain(plainWord));
    let settings = DictionarySettings.fromPlain(plain.settings);
    let markers = Markers.fromPlain(plain.markers);
    let path = plain.path;
    let dictionary = new Dictionary(words, settings, markers, path);
    return dictionary;
  }

  public toPlain(): PlainDictionary {
    let words = this.words.map((word) => word.toPlain());
    let settings = this.settings;
    let markers = this.markers;
    let path = this.path;
    return {words, settings, markers, path};
  }

  public static fromString(string: string): Dictionary {
    throw new Error("not yet implemented");
  }

  public toString(): string {
    throw new Error("not yet implemented");
  }

  public search(parameter: WordParameter): SearchResult {
    let beforeDate = new Date();
    let words = this.words.filter((word) => parameter.match(word));
    let suggestions = new Array<never>();
    Word.sortWords(words);
    let afterDate = new Date();
    let elapsedTime = afterDate.getTime() - beforeDate.getTime();
    return {words, suggestions, elapsedTime};
  }

  public findByUid(uid: string): Word | undefined {
    let word = this.words.find((word) => word.uid === uid);
    return word;
  }

  public findByUniqueName(uniqueName: string, excludedUniqueName?: string): Word | undefined {
    let word = this.words.find((word) => {
      if (excludedUniqueName !== undefined) {
        return word.uniqueName !== excludedUniqueName && word.uniqueName === uniqueName;
      } else {
        return word.uniqueName === uniqueName;
      }
    });
    return word;
  }

  public editWord(uid: string | null, word: PlainWord, skipValidate?: boolean): void {
    let errorType = (skipValidate) ? null : this.validateEditWord(uid, word);
    if (errorType === null) {
      if (uid !== null) {
        let oldWord = this.words.find((word) => word.uid === uid);
        if (oldWord !== undefined) {
          oldWord.edit(word);
        }
      } else {
        let newWord = Word.fromPlain(word);
        newWord.setDictionary(this);
        this.words.push(newWord);
      }
    } else {
      throw new ValidationError(errorType);
    }
  }

  public validateEditWord(uid: string | null, word: PlainWord): string | null {
    if (uid !== null) {
      let oldWord = this.words.find((word) => word.uid === uid);
      if (oldWord !== undefined) {
        if (this.findByUniqueName(word.uniqueName, oldWord.uniqueName) !== undefined) {
          return "duplicateUniqueName";
        } else {
          return oldWord.validateEdit(word);
        }
      } else {
        return "noSuchWord";
      }
    } else {
      if (this.findByUniqueName(word.uniqueName) !== undefined) {
        return "duplicateUniqueName";
      } else {
        return null;
      }
    }
  }

  public deleteWord(uid: string): void {
    let oldWordIndex = this.words.findIndex((word) => word.uid === uid);
    if (oldWordIndex >= 0) {
      this.words.splice(oldWordIndex, 1);
    }
  }

  public getMarkers(uniqueName: string): Array<Marker> {
    let markers = this.markers.get(uniqueName);
    return markers;
  }

  public toggleMarker(uniqueName: string, marker: Marker): void {
    this.markers.toggle(uniqueName, marker);
  }

  public changeSettings(settings: PlainDictionarySettings): void {
    let nextSettings = DictionarySettings.fromPlain(settings);
    this.settings = nextSettings;
  }

}


export interface PlainDictionary {

  words: Array<PlainWord>;
  settings: PlainDictionarySettings;
  markers: Map<string, Array<Marker>>;
  path: string | null;

}


export type SearchResult = {words: Array<Word>, suggestions: Array<never>, elapsedTime: number};