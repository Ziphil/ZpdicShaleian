//


export class Equivalent<S> {

  public readonly category: string;
  public readonly frame: S;
  public readonly names: ReadonlyArray<S>;
  public readonly hidden: boolean;

  public constructor(category: string, frame: S, names: Array<S>, hidden: boolean) {
    this.category = category;
    this.frame = frame;
    this.names = names;
    this.hidden = hidden;
  }

}