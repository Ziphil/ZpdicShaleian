//

import {
  ObjectUtil
} from "../../../util/object";
import {
  ASPECT_DATA,
  NEGATIVE_DATA,
  TENSE_DATA,
  TRANSITIVITY_DATA,
  VERBAL_INFLECTION_CATEGORY_DATA,
  VerbFeature,
  VerbalInflectionCategory
} from "../data/stable-data";
import {
  Dictionary
} from "../dictionary";
import {
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";
import {
  IgnoreOptions,
  WordParameter
} from "../word-parameter/word-parameter";


export class InflectionSuggester {

  private search: string;
  private normalizedSearch: string;
  private ignoreOptions: IgnoreOptions;
  private verbalCandidates: Array<{name: string, category: VerbalInflectionCategory, feature: VerbFeature | null, negative: boolean}>;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    this.search = search;
    this.ignoreOptions = ignoreOptions;
    this.verbalCandidates = [];
    this.normalizedSearch = WordParameter.normalize(search, ignoreOptions);
  }

  public prepare(): void {
    let search = this.search;
    let candidates = [];
    {
      let category = "verb" as const;
      for (let [tense, tenseData] of ObjectUtil.entries(TENSE_DATA)) {
        for (let [aspect, aspectData] of ObjectUtil.entries(ASPECT_DATA)) {
          for (let [transitivity, transitivityData] of ObjectUtil.entries(TRANSITIVITY_DATA)) {
            for (let negative of [true, false]) {
              let suffix = tenseData.suffix + aspectData.suffix[transitivity];
              let prefix = (negative) ? NEGATIVE_DATA.prefix : "";
              if (search.startsWith(prefix) && search.endsWith(suffix)) {
                let regexp = new RegExp(`^${prefix}|${suffix}$`, "g");
                let name = search.replaceAll(regexp, "");
                let feature = {tense, aspect, transitivity};
                candidates.push({category, feature, negative, name});
              }
            }
          }
        }
      }
    }
    for (let category of ["adjective", "adverb", "nounAdverb"] as const) {
      for (let negative of [true, false]) {
        let categoryPrefix = VERBAL_INFLECTION_CATEGORY_DATA[category].prefix;
        let negativePrefix = (negative) ? NEGATIVE_DATA.prefix : "";
        let prefix = categoryPrefix + negativePrefix;
        if (search.startsWith(prefix)) {
          let regexp = new RegExp(`^${prefix}`, "g");
          let name = search.replaceAll(regexp, "");
          let feature = null;
          candidates.push({name, category, feature, negative});
        }
      }
    }
    this.verbalCandidates = candidates;
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    let suggestions = [];
    for (let candidate of this.verbalCandidates) {
      if (candidate.name === word.name) {
        let suggestion = new VerbalInflectionSuggestion(word.name, candidate.category, candidate.feature, candidate.negative);
        suggestions.push(suggestion);
      }
    }
    return suggestions;
  }

}


export class VerbalInflectionSuggestion extends Suggestion<"verbalInflection"> {

  public readonly category: VerbalInflectionCategory;
  public readonly feature: VerbFeature | null;
  public readonly negative: boolean;

  public constructor(name: string, category: VerbalInflectionCategory, feature: VerbFeature | null, negative: boolean) {
    super("verbalInflection", [name]);
    this.category = category;
    this.feature = feature;
    this.negative = negative;
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(SUGGESTION_KIND_DATA.verbalInflection.names, language);
  }

  public getKeywords(language: string): Array<string> {
    let rawKeywords = [];
    rawKeywords.push(ObjectUtil.get(VERBAL_INFLECTION_CATEGORY_DATA[this.category].names, language));
    if (this.feature !== null) {
      rawKeywords.push(ObjectUtil.get(TENSE_DATA[this.feature.tense].names, language));
      rawKeywords.push(ObjectUtil.get(ASPECT_DATA[this.feature.aspect].names, language));
      rawKeywords.push(ObjectUtil.get(TRANSITIVITY_DATA[this.feature.transitivity].names, language));
    }
    if (this.negative) {
      rawKeywords.push(ObjectUtil.get(NEGATIVE_DATA.names, language));
    }
    let keywords = rawKeywords.filter((keyword) => keyword) as any;
    return keywords;
  }

}


export const SUGGESTION_KIND_DATA = {
  verbalInflection: {names: {ja: "動辞の語形変化", en: "Inflection of verbal"}},
  nominalInflection: {names: {ja: "名辞の語形変化", en: "Inflection of nominal"}},
  adverbialInflection: {names: {ja: "副辞の語形変化", en: "Inflection of adverbial"}},
  particleInflection: {names: {ja: "助接辞の語形変化", en: "Inflection of particle"}},
  revision: {names: {ja: "綴り改定", en: "Spelling revision"}}
} as const;