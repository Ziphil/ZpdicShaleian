//


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


export class InformationUtil {

  public static isNormal<S>(information: Information<S>): information is NormalInformation<S> {
    return information.kind !== "phrase" && information.kind !== "example";
  }

  public static isPhrase<S>(information: Information<S>): information is PhraseInformation<S> {
    return information.kind === "phrase";
  }

  public static isExample<S>(information: Information<S>): information is ExampleInformation<S> {
    return information.kind === "example";
  }

}


export class InformationKindUtil {

  public static fromCode(code: string): InformationKind | undefined {
    let entry = Object.entries(INFORMATION_KIND_DATA).find(([kind, data]) => data.code === code);
    if (entry !== undefined) {
      return entry[0] as any;
    } else {
      return undefined;
    }
  }

  public static getCode(kind: InformationKind): string {
    let code = INFORMATION_KIND_DATA[kind].code;
    return code;
  }

  public static getName(kind: InformationKind, language: string): string | undefined {
    let names = INFORMATION_KIND_DATA[kind].names as any;
    let name = names[language];
    return name;
  }

}


export const INFORMATION_KIND_DATA = {
  meaning: {code: "M", names: {ja: "語義", en: "Meaning"}},
  etymology: {code: "E", names: {ja: "語源", en: "Etymology"}},
  usage: {code: "U", names: {ja: "語法", en: "Usage"}},
  note: {code: "N", names: {ja: "備考", en: "Note"}},
  task: {code: "O", names: {ja: "タスク", en: "Task"}},
  history: {code: "H", names: {ja: "履歴", en: "History"}},
  phrase: {code: "P", names: {ja: "成句", en: "Phrase"}},
  example: {code: "S", names: {ja: "例文", en: "Example"}}
} as const;

export type InformationKind = keyof typeof INFORMATION_KIND_DATA;
export type NormalInformationKind = Exclude<InformationKind, "phrase" | "example">;