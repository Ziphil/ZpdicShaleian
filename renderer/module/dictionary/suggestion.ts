//

import {
  Word
} from "./word";


export class Suggestion {

  public readonly kind: SuggestionKind;
  public readonly names: ReadonlyArray<string>;

  public constructor(kind: SuggestionKind, names: ReadonlyArray<string>) {
    this.kind = kind;
    this.names = names;
  }

}


export type SuggestionKind = "revision" | "conjugation";