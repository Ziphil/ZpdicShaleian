//

import {
  PlainWord,
  Word
} from "./word";
import {
  WordParameter
} from "./word-parameter/word-parameter";


export class Dictionary implements PlainDictionary {

  public words: Array<Word>;
  public settings: any;
  public markers: Map<string, Array<Marker>>;
  public path: string | null;

  public constructor(words: Array<Word>, settings: any, markers: Map<string, Array<Marker>>, path: string | null) {
    this.words = words;
    this.settings = settings;
    this.markers = markers;
    this.path = path;
  }

  public static fromPlain(plain: PlainDictionary): Dictionary {
    let words = plain.words.map((word) => Word.fromPlain(word));
    let settings = plain.settings;
    let markers = plain.markers;
    let path = plain.path;
    let dictionary = new Dictionary(words, settings, markers, path);
    return dictionary;
  }

  public search(parameter: WordParameter): {words: Array<Word>, suggestions: []} {
    let words = this.words.filter((word) => parameter.match(word));
    return {words, suggestions: []};
  }

  public findByUid(uid: string): Word | undefined {
    let word = this.words.find((word) => word.uid === uid);
    return word;
  }

  public findByName(name: string): Word | undefined {
    let word = this.words.find((word) => word.name === name);
    return word;
  }

  public getMarkers(word: Word): Array<Marker> {
    let markers = this.markers.get(word.name) ?? [];
    return markers;
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

  public toggleMarker(name: string, marker: Marker): void {
    let markers = [...(this.markers.get(name) ?? [])];
    let index = markers.findIndex((existingMarker) => existingMarker === marker);
    if (index >= 0) {
      markers.splice(index, 1);
    } else {
      markers.push(marker);
    }
    if (markers.length > 0) {
      this.markers.set(name, markers);
    } else {
      this.markers.delete(name);
    }
  }

}


export interface PlainDictionary {

  words: Array<PlainWord>;
  settings: any;
  markers: Map<string, Array<Marker>>;
  path: string | null;

}


export type Marker = "circle" | "square" | "up" | "diamond" | "down" | "cross" | "pentagon" | "heart";