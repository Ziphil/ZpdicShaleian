//


export abstract class Suggestion<K extends string = string> {

  public readonly kind: K;
  public readonly names: ReadonlyArray<string>;

  public constructor(kind: K, names: ReadonlyArray<string>) {
    this.kind = kind;
    this.names = names;
  }

  public abstract getKindName(language: string): string | undefined;

  public abstract getKeywords(language: string): Array<string>;

}


export class RevisionSuggestion extends Suggestion<"revision"> {

  public constructor(names: ReadonlyArray<string>) {
    super("revision", names);
  }

  public getKindName(language: string): string | undefined {
    let names = COMMON_SUGGESTION_KIND_DATA.revision.names as any;
    let name = names[language];
    return name;
  }

  public getKeywords(language: string): Array<string> {
    return [];
  }

}


export const COMMON_SUGGESTION_KIND_DATA = {
  revision: {names: {ja: "綴り改定", en: "Spelling revision"}},
  combination: {names: {ja: "結合", en: "Combination"}}
} as const;