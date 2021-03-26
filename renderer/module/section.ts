//

import {
  Equivalent
} from "./equivalent";
import {
  Information
} from "./information";
import {
  Relation
} from "./relation";


export class Section<S> {

  public readonly lexicalCategory: string;
  public readonly equivalents: ReadonlyArray<Equivalent<S>>;
  public readonly informations: ReadonlyArray<Information<S>>;
  public readonly relations: ReadonlyArray<Relation<S>>;

  public constructor(lexicalCategory: string, equivalents: Array<Equivalent<S>>, informations: Array<Information<S>>, relations: Array<Relation<S>>) {
    this.lexicalCategory = lexicalCategory;
    this.equivalents = equivalents;
    this.informations = informations;
    this.relations = relations;
  }

}