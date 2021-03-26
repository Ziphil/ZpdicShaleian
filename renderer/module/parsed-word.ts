//

import {
  Part
} from "./part";


export class ParsedWord<S> {

  public readonly name: string;
  public readonly date: number;
  public readonly parts: ReadonlyMap<string, Part<S>>;

  public constructor(name: string, date: number, parts: Map<string, Part<S>>) {
    this.name = name;
    this.date = date;
    this.parts = parts;
  }

}