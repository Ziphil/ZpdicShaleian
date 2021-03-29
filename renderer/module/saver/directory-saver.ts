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
  Saver
} from "./saver";


export class DirectorySaver extends Saver {

  private size: number = 0;
  private count: number = 0;

  public constructor(dictionary: Dictionary, path?: string | null) {
    super(dictionary, path);
  }

  public start(): void {
    let words = this.dictionary.words;
    this.size = words.length;
    fs.mkdir(this.path, {recursive: true}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        for (let word of words) {
          let wordPath = path.join(this.path, word.name + ".nxdw");
          this.saveWord(word, wordPath);
        }
      }
    });
  }

  private saveWord(word: Word, wordPath: string): void {
    let string = word.toString();
    fs.writeFile(wordPath, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.count ++;
        this.emitProgress();
        if (this.count >= this.size) {
          this.emit("end");
        }
      }
    });
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}