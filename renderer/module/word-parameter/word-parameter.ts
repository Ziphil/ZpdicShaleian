//

import {
  Word
} from "../word";
import {
  NormalWordParameter
} from "./normal-word-parameter";


export abstract class WordParameter {

  public abstract language: string;

  public abstract match(word: Word): boolean;

  public static getNormal(parameter: WordParameter): NormalWordParameter {
    let language = parameter.language;
    if (parameter instanceof NormalWordParameter) {
      return parameter;
    } else {
      return NormalWordParameter.createEmpty(language);
    }
  }

  protected static createCandidates(word: Word, mode: WordMode, language: string): Array<string> {
    if (mode === "name") {
      return [word.name];
    } else if (mode === "equivalent") {
      return word.equivalentNames[language] ?? [];
    } else if (mode === "both") {
      return [word.name, ...(word.equivalentNames[language] ?? [])];
    } else if (mode === "content") {
      return [word.contents[language] ?? ""];
    } else {
      throw new Error("cannot happen");
    }
  }

  protected static createMatcher(type: string): (search: string, candidate: string) => boolean {
    if (type === "exact") {
      let matcher = function (search: string, candidate: string): boolean {
        return candidate === search;
      }
      return matcher;
    } else if (type === "prefix") {
      let matcher = function (search: string, candidate: string): boolean {
        return candidate.startsWith(search);
      }
      return matcher;
    } else if (type === "suffix") {
      let matcher = function (search: string, candidate: string): boolean {
        return candidate.endsWith(search);
      }
      return matcher;
    } else if (type === "part") {
      let matcher = function (search: string, candidate: string): boolean {
        return candidate.includes(search);
      }
      return matcher;
    } else if (type === "pair") {
      let matcher = function (search: string, candidate: string): boolean {
        try {
          if (search.length <= 10) {
            let predicate = false;
            for (let i = 0 ; i < search.length ; i ++) {
              let beforeSearch = search.substring(0, i);
              let afterSearch = search.substring(i + 1);
              let regexp = new RegExp("^" + beforeSearch + "." + afterSearch + "$");
              if (candidate.match(regexp) !== null) {
                predicate = true;
                break;
              }
            }
            return predicate;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      }
      return matcher;
    } else if (type === "regular") {
      let matcher = function (search: string, candidate: string): boolean {
        try {
          let regexp = new RegExp(search, "m");
          return candidate.match(regexp) !== null;
        } catch (error) {
          return false;
        }
      }
      return matcher;
    } else {
      throw new Error("cannot happen");
    }
  }

}


export const WORD_MODES = ["name", "equivalent", "both", "content"] as const;
export type WordMode = (typeof WORD_MODES)[number];

export const WORD_TYPES = ["exact", "prefix", "suffix", "part", "pair", "regular"] as const;
export type WordType = (typeof WORD_TYPES)[number];