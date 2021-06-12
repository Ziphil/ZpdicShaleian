//

import {
  MouseEvent
} from "react";


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
      key = key.replaceAll(/\b(\w+)\b/g, (string) => string.charAt(0).toUpperCase() + string.slice(1));
      return key;
    } else {
      return undefined;
    }
  }

  public getHandler(name: string): KeyHandler | undefined {
    let handler = this.specs[name]?.handler ?? this.specs.fallback?.handler;
    return handler;
  }

  public getKeys(): {[name: string]: KeySequence} {
    let keys = Object.fromEntries(Object.entries(this.specs).map(([name, spec]) => [name, spec.key]).filter(([name, key]) => key !== undefined));
    return keys;
  }

  public getHandlers(): {[name: string]: KeyHandler} {
    let handlers = Object.fromEntries(Object.entries(this.specs).map(([name, spec]) => [name, spec.handler]).filter(([name, handler]) => handler !== undefined));
    return handlers;
  }

}


export type HandlerSpecs = {[name: string]: HandlerSpec};
export type HandlerSpec = {key?: KeySequence, handler?: KeyHandler};
export type KeySequence = string | Array<string>;
export type KeyHandler = (event?: KeyboardEvent | MouseEvent<HTMLElement>) => void;