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

  public get fields(): ReadonlyArray<Field<S>> {
    return [...this.equivalents, ...this.informations, ...this.relations];
  }

}


export class FieldUtil {

  public static isEquivalent<S>(field: Field<S>): field is Equivalent<S> {
    return field instanceof Equivalent;
  }

  public static isInformation<S>(field: Field<S>): field is Information<S> {
    return !(field instanceof Equivalent) && !(field instanceof Relation);
  }

  public static isRelation<S>(field: Field<S>): field is Relation<S> {
    return field instanceof Relation;
  }

}


export type Field<S> = Equivalent<S> | Information<S> | Relation<S>;