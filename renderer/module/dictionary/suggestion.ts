//


export abstract class Suggestion<K extends string = string> {

  public readonly kind: K;
  public readonly names: ReadonlyArray<string>;

  public constructor(kind: K, names: ReadonlyArray<string>) {
    this.kind = kind;
    this.names = names;
  }

  public abstract getKindName(language: string): string | undefined;

  public abstract getKeywords(language: string): Array<string | undefined>;

}