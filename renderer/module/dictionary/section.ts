//

import {
  Equivalent
} from "./equivalent";
import {
  ExampleInformation,
  Information,
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
    let informations = this.informations.filter((information) => information instanceof NormalInformation) as Array<NormalInformation<S>>;
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getPhraseInformations(onlyVisible?: boolean): ReadonlyArray<PhraseInformation<S>> {
    let informations = this.informations.filter((information) => information instanceof PhraseInformation) as Array<PhraseInformation<S>>;
    if (onlyVisible) {
      informations = informations.filter((information) => !information.hidden);
    }
    return informations;
  }

  public getExampleInformations(onlyVisible?: boolean): ReadonlyArray<ExampleInformation<S>> {
    let informations = this.informations.filter((information) => information instanceof ExampleInformation) as Array<ExampleInformation<S>>;
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


export type Field<S> = Equivalent<S> | Information<S> | Relation<S>;