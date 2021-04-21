//

import {
  Part
} from "./part";


export class ParsedWord<S> {

  public readonly name: string;
  public readonly uniqueName: string;
  public readonly date: number;
  public readonly parts: Parts<S>;

  public constructor(name: string, uniqueName: string, date: number, parts: Parts<S>) {
    this.name = name;
    this.uniqueName = uniqueName;
    this.date = date;
    this.parts = parts;
  }

}


export type Parts<S> = {readonly [language: string]: Part<S> | undefined};