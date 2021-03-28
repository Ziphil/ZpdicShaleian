//

import {
  Word
} from "./word";
import {
  WordParameter
} from "./word-parameter/word-parameter";


export class Dictionary {

  public words: Array<Word>;

  public constructor(words: Array<Word>) {
    this.words = words;
  }

  public static fromPlain(plain: Dictionary): Dictionary {
    let words = plain.words.map((word) => Word.fromPlain(word));
    let dictionary = new Dictionary(words);
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

  public editWord(uid: string | null, word: Word): void {
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

}