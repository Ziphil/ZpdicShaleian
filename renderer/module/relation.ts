//


export class Relation<S> {

  public readonly title: string | null;
  public readonly names: ReadonlyArray<S>;

  public constructor(title: string | null, names: Array<S>) {
    this.title = title;
    this.names = names;
  }

}