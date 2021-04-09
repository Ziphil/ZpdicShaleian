//


export class Equivalent<S> {

  public readonly category: string | null;
  public readonly frame: S | null;
  public readonly names: ReadonlyArray<S>;
  public readonly hidden: boolean;

  public constructor(category: string | null, frame: S | null, names: ReadonlyArray<S>, hidden: boolean) {
    this.category = category;
    this.frame = frame;
    this.names = names;
    this.hidden = hidden;
  }

}