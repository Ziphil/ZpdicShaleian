//

import * as fs from "fs";
import * as path from "path";
import {
  Dictionary
} from "../dictionary";
import {
  Word
} from "../word";
import {
  Loader
} from "./loader";


export class SplitLoader extends Loader {

  public path: string;
  private words: Array<Word> = [];
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
    this.path = path;
  }

  public start(): void {
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
          let settings = null;
          let markers = new Map();
          let dictionary = new Dictionary(words, settings, markers);
          this.emit("end", dictionary);
        }
      }
    });
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}


export type LoaderEvent = {
  word: [word: Word],
  progress: [progress: number],
  end: [dictionary: Dictionary],
  error: [error: Error]
};