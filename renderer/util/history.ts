//


export class History<T> {

  private elements: Array<T> = [];
  private pointer: number;
  private maxLength: number;

  public constructor(element: T, maxLength?: number) {
    this.elements.push(element);
    this.pointer = 0;
    this.maxLength = maxLength ?? 100;
  }

  public add(element: T): void {
    this.pointer ++;
    this.elements.splice(this.pointer);
    this.elements.push(element);
    if (this.pointer >= this.maxLength) {
      this.elements.shift();
      this.pointer --;
    }
  }

  public undo(): T | undefined {
    if (this.pointer > 0) {
      this.pointer --;
      let element = this.elements[this.pointer];
      return element;
    } else {
      return undefined;
    }
  }

  public redo(): T | undefined {
    if (this.pointer < this.elements.length - 1) {
      this.pointer ++;
      let element = this.elements[this.pointer];
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