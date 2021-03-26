//

import {
  Section
} from "./section";


export class Part<S> {

  public readonly lexicalCategory: string;
  public readonly sections: ReadonlyArray<Section<S>>;

  public constructor(lexicalCategory: string, sections: Array<Section<S>>) {
    this.lexicalCategory = lexicalCategory;
    this.sections = sections;
  }

}