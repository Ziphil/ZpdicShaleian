//

import {
  Section
} from "./section";


export class Part<S> {

  public readonly sections: ReadonlyArray<Section<S>>;

  public constructor(sections: Array<Section<S>>) {
    this.sections = sections;
  }

}