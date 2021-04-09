//

import {
  Section
} from "./section";


export class Part<S> {

  public readonly sections: ReadonlyArray<Section<S>>;

  public constructor(sections: ReadonlyArray<Section<S>>) {
    this.sections = sections;
  }

  public get lexicalCategory(): string | null {
    let section = this.sections[0];
    if (section !== undefined) {
      return section.lexicalCategory;
    } else {
      return null;
    }
  }

}