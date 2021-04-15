//

import {
  Equivalent
} from "./equivalent";
import {
  ExampleInformation,
  Information,
  InformationUtil,
  NormalInformation,
  PhraseInformation
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

  public getEquivalents(onlyVisible?: boolean): ReadonlyArray<Equivalent<S>> {
    let equivalents = this.equivalents;
    if (onlyVisible) {
      equivalents = equivalents.filter((equivalent) => !equivalent.hidden);
    }
    return equivalents;
  }

  public getInformations(onlyVisible?: boolean): ReadonlyArray<Information<S>> {
    let informations = this.informations;
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getNormalInformations(onlyVisible?: boolean): ReadonlyArray<NormalInformation<S>> {
    let informations = this.informations.filter(InformationUtil.isNormal);
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getPhraseInformations(onlyVisible?: boolean): ReadonlyArray<PhraseInformation<S>> {
    let informations = this.informations.filter(InformationUtil.isPhrase);
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getExampleInformations(onlyVisible?: boolean): ReadonlyArray<ExampleInformation<S>> {
    let informations = this.informations.filter(InformationUtil.isExample);
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getFields(onlyVisible?: boolean): ReadonlyArray<Field<S>> {
    let equivalents = this.getEquivalents(onlyVisible);
    let informations = this.getInformations(onlyVisible);
    let relations = this.relations;
    let fields = [...equivalents, ...informations, ...relations];
    return fields;
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