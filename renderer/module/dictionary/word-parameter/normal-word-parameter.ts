//

import {
  Dictionary
} from "../dictionary";
import {
  RevisionSuggestion,
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";
import {
  IgnoreOptions,
  WordMode,
  WordParameter,
  WordType
} from "./word-parameter";


export class NormalWordParameter extends WordParameter {

  public search: string;
  public mode: WordMode;
  public type: WordType;
  public language: string;
  public ignoreOptions: IgnoreOptions;

  public constructor(search: string, mode: WordMode, type: WordType, language: string, ignoreOptions?: IgnoreOptions) {
    super();
    this.search = search;
    this.mode = mode;
    this.type = type;
    this.language = language;
    this.ignoreOptions = ignoreOptions ?? NormalWordParameter.getDefaultIgnoreOptions(mode, type);
  }

  public static createEmpty(language: string): NormalWordParameter {
    let parameter = new NormalWordParameter("", "both", "prefix", language);
    return parameter;
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    let mode = this.mode;
    let type = this.type;
    if ((mode === "name" || mode === "both") && (type === "exact" || type === "prefix")) {
      let revisions = dictionary.settings.revisions;
      let names = revisions.resolve(this.search);
      if (names.length > 0) {
        let suggestion = new RevisionSuggestion(names);
        return [suggestion];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  public match(word: Word): boolean {
    let candidates = WordParameter.createCandidates(word, this.mode, this.language);
    let matcher = WordParameter.createMatcher(this.type);
    let normalizedSearch = WordParameter.normalize(this.search, this.ignoreOptions);
    let predicate = candidates.some((candidate) => {
      let normalizedCandidate = WordParameter.normalize(candidate, this.ignoreOptions);
      return matcher(normalizedSearch, normalizedCandidate);
    });
    return predicate;
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    return [];
  }

  private static getDefaultIgnoreOptions(mode: WordMode, type: WordType): IgnoreOptions {
    if ((mode === "name" || mode === "both") && (type !== "pair" && type !== "regular")) {
      return {case: false, diacritic: true};
    } else {
      return {case: false, diacritic: false};
    }
  }

}