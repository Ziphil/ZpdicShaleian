//

import * as fs from "fs";
import * as path from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DictionarySettings
} from "../dictionary-settings";
import {
  Word
} from "../word";
import {
  Loader
} from "./loader";


export class DirectoryLoader extends Loader {

  private words: Array<Word>;
  private settings: DictionarySettings;
  private size: number = 0;
  private count: number = 0;
  private settingsLoaded: boolean = false;

  public constructor(path: string) {
    super(path);
    this.words = [];
    this.settings = DictionarySettings.createEmpty();
  }

  public start(): void {
    fs.readdir(this.path, (error, paths) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          let wordLocalPaths = paths.filter((path) => path.endsWith(".nxdw"));
          this.size = wordLocalPaths.length;
          for (let wordLocalPath of wordLocalPaths) {
            let wordPath = path.join(this.path, wordLocalPath);
            this.loadWord(wordPath);
          }
          let settingsPath = path.join(this.path, "$SETTINGS.nxds");
          this.loadSettings(settingsPath);
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private loadWord(wordPath: string): void {
    fs.readFile(wordPath, {encoding: "utf-8"}, (error, string) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          let word = Word.fromString(string);
          this.words.push(word);
          this.count ++;
          this.emitProgress();
          this.checkEnded();
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private loadSettings(settingsPath: string): void {
    fs.readFile(settingsPath, {encoding: "utf-8"}, (error, string) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          let settings = DictionarySettings.fromString(string);
          this.settings = settings;
          this.settingsLoaded = true;
          this.checkEnded();
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private checkEnded(): void {
    if (this.count >= this.size && this.settingsLoaded) {
      let words = this.words;
      let settings = this.settings;
      let markers = new Map();
      let path = this.path;
      let dictionary = new Dictionary(words, settings, markers, path);
      this.emit("end", dictionary);
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}