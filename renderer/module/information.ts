//

import {
  InformationKind
} from "./information-kind";


export class NormalInformation<S> {

  public readonly kind: InformationKind;
  public readonly text: S;
  public readonly date: number | null;
  public readonly hidden: boolean;

  public constructor(kind: InformationKind, text: S, date?: number, hidden?: boolean) {
    this.kind = kind;
    this.text = text;
    this.date = date ?? null;
    this.hidden = hidden ?? false;
  }

}


export class PhraseInformation<S> {

  public readonly kind: "phrase";
  public readonly expression: S;
  public readonly equivalents: ReadonlyArray<S>;
  public readonly text: S;
  public readonly date: number | null;
  public readonly hidden: boolean;

  public constructor(expression: S, equivalents: Array<S>, text: S, date?: number, hidden?: boolean) {
    this.kind = "phrase";
    this.expression = expression;
    this.equivalents = equivalents;
    this.text = text;
    this.date = date ?? null;
    this.hidden = hidden ?? false;
  }

}


export class ExampleInformation<S> {

  public readonly kind: "example";
  public readonly sentence: S;
  public readonly translation: S;
  public readonly date: number | null;
  public readonly hidden: boolean;

  public constructor(sentence: S, translation: S, date?: number, hidden?: boolean) {
    this.kind = "example";
    this.sentence = sentence;
    this.translation = translation;
    this.date = date ?? null;
    this.hidden = hidden ?? false;
  }

}


export type Information<S> = NormalInformation<S> | PhraseInformation<S> | ExampleInformation<S>;