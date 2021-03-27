//

import {
  Part
} from "./part";


export class ParsedWord<S> {

  public readonly name: string;
  public readonly date: number;
  public readonly parts: Readonly<Parts<S>>;

  public constructor(name: string, date: number, parts: Parts<S>) {
    this.name = name;
    this.date = date;
    this.parts = parts;
  }

}


export type Parts<S> = {[language: string]: Part<S> | undefined};