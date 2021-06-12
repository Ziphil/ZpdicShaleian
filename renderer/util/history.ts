//


export class History<T> {

  private elements: Array<T> = [];
  private pointer: number = 0;

  public constructor(element: T) {
    this.elements.push(element);
  }

  public add(element: T): void {
    this.elements.splice(++ this.pointer);
    this.elements.push(element);
  }

  public undo(): T | undefined {
    if (this.pointer > 0) {
      let element = this.elements[-- this.pointer];
      return element;
    } else {
      return undefined;
    }
  }

  public redo(): T | undefined {
    if (this.pointer < this.elements.length - 1) {
      let element = this.elements[++ this.pointer];
      return element;
    } else {
      return undefined;
    }
  }

  public canUndo(): boolean {
    return this.pointer > 0;
  }

  public canRedo(): boolean {
    return this.pointer < this.elements.length - 1;
  }

}