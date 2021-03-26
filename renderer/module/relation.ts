//


export class Relation<S> {

  public readonly title: string;
  public readonly names: ReadonlyArray<S>;

  public constructor(title: string, names: Array<S>) {
    this.title = title;
    this.names = names;
  }

}