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


export class DirectoryLoader extends Loader {

  private words: Array<Word> = [];
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
  }

  public start(): void {
    fs.readdir(this.path, (error, paths) => {
      if (error) {
        this.emit("error", error);
      } else {
        let wordLocalPaths = paths.filter((path) => path.endsWith(".nxdw"));
        this.size = wordLocalPaths.length;
        for (let wordLocalPath of wordLocalPaths) {
          let wordPath = path.join(this.path, wordLocalPath);
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
          let path = this.path;
          let dictionary = new Dictionary(words, settings, markers, path);
          this.emit("end", dictionary);
        }
      }
    });
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}