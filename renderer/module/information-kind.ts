//


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
  example: {code: "E", names: {ja: "例文", en: "Example"}}
} as const;

export type InformationKind = keyof typeof INFORMATION_KIND_DATA;
export type NormalInformationKind = Exclude<InformationKind, "phrase" | "example">;