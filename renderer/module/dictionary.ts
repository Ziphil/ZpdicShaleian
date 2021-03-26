//

import {
  Word
} from "./word";


export class Dictionary {

  public words: Array<Word>;

  public constructor(words: Array<Word>) {
    this.words = words;
  }

}