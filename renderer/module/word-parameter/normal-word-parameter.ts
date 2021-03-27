//

import {
  Word
} from "../word";
import {
  WordMode,
  WordParameter,
  WordType
} from "./word-parameter";


export class NormalWordParameter extends WordParameter {

  public search: string;
  public mode: WordMode;
  public type: WordType;
  public language: string;

  public constructor(search: string, mode: WordMode, type: WordType, language: string) {
    super();
    this.search = search;
    this.mode = mode;
    this.type = type;
    this.language = language;
  }

  public static createEmpty(language: string): NormalWordParameter {
    let parameter = new NormalWordParameter("", "both", "prefix", language);
    return parameter;
  }

  public match(word: Word): boolean {
    let candidates = WordParameter.createCandidates(word, this.mode, this.language);
    let matcher = WordParameter.createMatcher(this.type);
    let result = candidates.some((candidate) => matcher(this.search, candidate));
    return result;
  }

}