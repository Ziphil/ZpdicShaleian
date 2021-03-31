//

import {
  DictionarySettings,
  PlainDictionarySettings
} from "./dictionary-settings";
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
  }

  public static fromPlain(plain: PlainDictionary): Dictionary {
    let words = plain.words.map((plainWord) => Word.fromPlain(plainWord));
    let settings = DictionarySettings.fromPlain(plain.settings);
    let markers = Markers.fromPlain(plain.markers);
    let path = plain.path;
    let dictionary = new Dictionary(words, settings, markers, path);
    return dictionary;
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
    this.sortWords(words);
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

  public editWord(uid: string | null, word: PlainWord): void {
    if (uid !== null) {
      let oldWord = this.words.find((word) => word.uid === uid);
      if (oldWord !== undefined) {
        oldWord.edit(word);
      }
    } else {
      let newWord = Word.fromPlain(word);
      this.words.push(newWord);
    }
  }

  public deleteWord(uid: string): void {
    let oldWordIndex = this.words.findIndex((word) => word.uid === uid);
    if (oldWordIndex >= 0) {
      this.words.splice(oldWordIndex, 1);
    }
  }

  public getMarkers(name: string): Array<Marker> {
    let markers = this.markers.get(name);
    return markers;
  }

  public toggleMarker(name: string, marker: Marker): void {
    this.markers.toggle(name, marker);
  }

  public changeSettings(settings: PlainDictionarySettings): void {
    let nextSettings = DictionarySettings.fromPlain(settings);
    this.settings = nextSettings;
  }

  private sortWords(words: Array<Word>): Array<Word> {
    let alphabetRule = this.settings.alphabetRule;
    let sortedWords = words.sort((firstWord, secondWord) => {
      let firstComparisonString = firstWord.getComparisonString(alphabetRule);
      let secondComparisonString = secondWord.getComparisonString(alphabetRule);
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

}


export interface PlainDictionary {

  words: Array<PlainWord>;
  settings: PlainDictionarySettings;
  markers: Map<string, Array<Marker>>;
  path: string | null;

}


export type SearchResult = {words: Array<Word>, suggestions: Array<never>, elapsedTime: number};