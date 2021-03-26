//

import * as fs from "fs";
import * as path from "path";
import {
  EventEmitter
} from "events";
import {
  Dictionary
} from "./dictionary";
import {
  Word
} from "./word";


export class Loader extends EventEmitter {

  public path: string;
  private words: Array<Word> = [];
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super();
    this.path = path;
  }

  public on<E extends keyof LoaderEvent>(event: E, listener: (...args: LoaderEvent[E]) => void): this;
  public on(event: string | symbol, listener: (...args: any) => void): this {
    let result = super.on(event, listener);
    return result;
  }

  public emit<E extends keyof LoaderEvent>(event: E, ...args: LoaderEvent[E]): boolean;
  public emit(event: string | symbol, ...args: any): boolean {
    let result = super.emit(event, ...args);
    return result;
  }

  public load(): void {
    fs.readdir(this.path, (error, paths) => {
      if (error) {
        this.emit("error", error);
      } else {
        let childPaths = paths.filter((path) => path.endsWith(".nxdw"));
        this.size = childPaths.length;
        for (let childPath of childPaths) {
          let wordPath = path.join(this.path, childPath);
          this.loadWord(wordPath);
        }
      }
    });
  }

  private loadWord(wordPath: string): void {
    fs.readFile(wordPath, {encoding: "utf-8"}, (error, string) => {
      if (error) {
        this.emit("error", error);
      } else {
        let word = Word.fromString(string);
        this.words.push(word);
        this.count ++;
        this.emitProgress();
        if (this.count >= this.size) {
          let words = this.words;
          let dictionary = new Dictionary(words);
          this.emit("end", dictionary);
        }
      }
    });
  }

  private emitProgress(): void {
    let progress = (this.size > 0) ? this.count / this.size : 0;
    this.emit("progress", progress);
  }

}


export type LoaderEvent = {
  word: [word: Word],
  progress: [progress: number],
  end: [dictionary: Dictionary],
  error: [error: Error]
};