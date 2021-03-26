//

import {
  Word
} from "./word";


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

}