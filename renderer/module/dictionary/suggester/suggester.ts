//

import {
  Dictionary
} from "../dictionary";
import {
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";


export abstract class Suggester {

  public abstract prepare(): void;

  public abstract presuggest(dictionary: Dictionary): Array<Suggestion>;

  public abstract suggest(word: Word, dictionary: Dictionary): Array<Suggestion>;

}