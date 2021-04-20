//

import {
  ObjectUtil
} from "../../util/object";


export class Information<S, K extends InformationKind = InformationKind> {

  public readonly kind: K;
  public readonly date: number | null;
  public readonly hidden: boolean;

  protected constructor(kind: K, date: number | null, hidden: boolean) {
    this.kind = kind;
    this.date = date;
    this.hidden = hidden;
  }

  public getKindName(language: string): string | undefined {
    return InformationKindUtil.getName(this.kind, language);
  }

}


export class NormalInformation<S> extends Information<S, NormalInformationKind> {

  public readonly text: S;

  public constructor(kind: NormalInformationKind, text: S, date: number | null, hidden: boolean) {
    super(kind, date, hidden);
    this.text = text;
  }

}


export class PhraseInformation<S> extends Information<S, "phrase"> {

  public readonly expression: S;
  public readonly equivalentNames: ReadonlyArray<S>;
  public readonly text: S | null;

  public constructor(expression: S, equivalentNames: ReadonlyArray<S>, text: S | null, date: number | null, hidden: boolean) {
    super("phrase", date, hidden);
    this.expression = expression;
    this.equivalentNames = equivalentNames;
    this.text = text;
  }

}


export class ExampleInformation<S> extends Information<S, "example"> {

  public readonly sentence: S;
  public readonly translation: S;

  public constructor(sentence: S, translation: S, date: number | null, hidden: boolean) {
    super("example", date, hidden);
    this.sentence = sentence;
    this.translation = translation;
  }

}


export class InformationKindUtil {

  public static fromTag(tag: string): InformationKind | undefined {
    let entry = ObjectUtil.entries(INFORMATION_KIND_DATA).find(([kind, data]) => data.tag === tag);
    if (entry !== undefined) {
      return entry[0] as any;
    } else {
      return undefined;
    }
  }

  public static getTag(kind: InformationKind): string {
    let tag = INFORMATION_KIND_DATA[kind].tag;
    return tag;
  }

  public static getName(kind: InformationKind, language: string): string | undefined {
    let name = ObjectUtil.get(INFORMATION_KIND_DATA[kind].names, language);
    return name;
  }

}


export const INFORMATION_KIND_DATA = {
  meaning: {tag: "M", names: {ja: "語義", en: "Meaning"}},
  etymology: {tag: "E", names: {ja: "語源", en: "Etymology"}},
  usage: {tag: "U", names: {ja: "語法", en: "Usage"}},
  note: {tag: "N", names: {ja: "備考", en: "Note"}},
  task: {tag: "O", names: {ja: "タスク", en: "Task"}},
  history: {tag: "H", names: {ja: "履歴", en: "History"}},
  phrase: {tag: "P", names: {ja: "成句", en: "Phrase"}},
  example: {tag: "S", names: {ja: "例文", en: "Example"}}
} as const;

export type InformationKind = keyof typeof INFORMATION_KIND_DATA;
export type NormalInformationKind = Exclude<InformationKind, "phrase" | "example">;