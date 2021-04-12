//


export class Relation<S> {

  public readonly title: string | null;
  public readonly entries: ReadonlyArray<RelationEntry<S>>;

  public constructor(title: string | null, entries: ReadonlyArray<RelationEntry<S>>) {
    this.title = title;
    this.entries = entries;
  }

}


export type RelationEntry<S> = {readonly name: S, readonly refer: boolean};