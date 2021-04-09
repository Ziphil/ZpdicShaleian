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

  public readonly lexicalCategory: string | null;
  public readonly equivalents: ReadonlyArray<Equivalent<S>>;
  public readonly informations: ReadonlyArray<Information<S>>;
  public readonly relations: ReadonlyArray<Relation<S>>;

  public constructor(lexicalCategory: string | null, equivalents: ReadonlyArray<Equivalent<S>>, informations: ReadonlyArray<Information<S>>, relations: ReadonlyArray<Relation<S>>) {
    this.lexicalCategory = lexicalCategory;
    this.equivalents = equivalents;
    this.informations = informations;
    this.relations = relations;
  }

}