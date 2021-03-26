//


export class InformationKindUtil {

  public static fromCode(code: string): InformationKind | undefined {
    let kind = INFORMATION_KIND_DATA.find((data) => data.code === code)?.kind;
    return kind;
  }

  public static toCode(kind: InformationKind): string {
    let code = INFORMATION_KIND_DATA.find((data) => data.kind === kind)!.code;
    return code;
  }

}


export const INFORMATION_KIND_DATA = [
  {code: "M", kind: "meaning"},
  {code: "E", kind: "etymology"}, 
  {code: "U", kind: "usage"}, 
  {code: "N", kind: "note"},
  {code: "O", kind: "task"},
  {code: "H", kind: "history"},
  {code: "P", kind: "phrase"},
  {code: "S", kind: "example"}
] as const;

export type InformationKind = (typeof INFORMATION_KIND_DATA)[number]["kind"];