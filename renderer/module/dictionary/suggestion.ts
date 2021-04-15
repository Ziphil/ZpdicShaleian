//

import {
  Word
} from "./word";


export class Suggestion {

  public readonly kind: SuggestionKind;
  public readonly words: ReadonlyArray<Word>;

  public constructor(kind: SuggestionKind, words: ReadonlyArray<Word>) {
    this.kind = kind;
    this.words = words;
  }

}


export type SuggestionKind = "revision" | "conjugation";