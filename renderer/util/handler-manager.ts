//


export class HandlerManager {

  private readonly specs: HandlerSpecs;

  public constructor(specs: HandlerSpecs) {
    this.specs = specs;
  }

  public getLabel(name: string): string | undefined {
    let rawKey = this.specs[name]?.key;
    let key = (Array.isArray(rawKey)) ? rawKey[0] : rawKey;
    if (key !== undefined) {
      key = key.replaceAll(/\b(\w+?)\+/g, (string) => string.charAt(0).toUpperCase() + string.slice(1));
      key = key.replaceAll(/\b(\w)\b/g, (string) => string.toUpperCase());
      return key;
    } else {
      return undefined;
    }
  }

  public getHandler(name: string): KeyHandler | undefined {
    let handler = this.specs[name]?.handler;
    return handler;
  }

  public getKeys(): {[name: string]: KeySequence} {
    let keys = Object.fromEntries(Object.entries(this.specs).map(([name, spec]) => [name, spec.key]));
    return keys;
  }

  public getHandlers(): {[name: string]: KeyHandler} {
    let handlers = Object.fromEntries(Object.entries(this.specs).map(([name, spec]) => [name, spec.handler]));
    return handlers;
  }

}


export type HandlerSpecs = {[name: string]: HandlerSpec};
export type HandlerSpec = {key: KeySequence, handler: KeyHandler};
export type KeySequence = string | Array<string>;
export type KeyHandler = () => void;