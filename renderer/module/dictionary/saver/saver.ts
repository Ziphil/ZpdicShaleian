//

import {
  EventEmitter
} from "events";
import {
  Dictionary
} from "../dictionary";


export abstract class Saver extends EventEmitter {

  protected readonly dictionary: Dictionary;
  protected readonly path: string;
  private lastProgressDate: Date | null = null;

  public constructor(dictionary: Dictionary, path: string | null) {
    super();
    let nextPath = path ?? dictionary.path;
    if (nextPath !== null && nextPath !== undefined) {
      this.dictionary = dictionary;
      this.path = nextPath;
    } else {
      throw new Error("path not specified");
    }
  }

  public asPromise(listeners: SaverEventListeners): Promise<void> {
    let promise = new Promise<void>((resolve, reject) => {
      if (listeners.onProgress) {
        this.on("progress", listeners.onProgress);
      }
      this.on("end", () => {
        if (listeners.onEnd) {
          listeners.onEnd();
        }
        resolve();
      });
      this.on("error", (error) => {
        if (listeners.onError) {
          listeners.onError(error);
        }
        reject(error);
      });
      this.start();
    });
    return promise;
  }

  public on<E extends keyof SaverEvent>(event: E, listener: (...args: SaverEvent[E]) => void): this;
  public on(event: string | symbol, listener: (...args: any) => void): this {
    let result = super.on(event, listener);
    return result;
  }

  public emit<E extends keyof SaverEvent>(event: E, ...args: SaverEvent[E]): boolean;
  public emit(event: string | symbol, ...args: any): boolean {
    if (event === "progress") {
      let date = new Date();
      let lastDate = this.lastProgressDate;
      if (lastDate === null || date.getTime() - lastDate.getTime() >= 100) {
        let result = super.emit(event, ...args);
        this.lastProgressDate = date;
        return result;
      } else {
        return false;
      }
    } else {
      let result = super.emit(event, ...args);
      return result;
    }
  }

  public abstract start(): void;

}


export type SaverEvent = {
  progress: [offset: number, size: number],
  end: [],
  error: [error: Error]
};

export type SaverEventListeners = {[E in keyof SaverEvent as `on${Capitalize<E>}`]?: (...args: SaverEvent[E]) => void};