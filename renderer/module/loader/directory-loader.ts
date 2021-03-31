//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DictionarySettings
} from "../dictionary-settings";
import {
  Markers
} from "../marker";
import {
  Word
} from "../word";
import {
  Loader
} from "./loader";


export class DirectoryLoader extends Loader {

  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
  }

  public start(): void {
    let promise = Promise.resolve().then(this.loadDictionary.bind(this));
    promise.then((dictionary) => {
      this.emit("end", dictionary);
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async loadDictionary(): Promise<Dictionary> {
    let wordsPromise = this.loadWords();
    let settingsPromise = this.loadSettings();
    let markersPromise = this.loadMarkers();
    let [words, settings, markers] = await Promise.all([wordsPromise, settingsPromise, markersPromise]);
    let dictionary = new Dictionary(words, settings, markers, this.path);
    return dictionary;
  }

  private async loadWords(): Promise<Array<Word>> {
    let paths = await fs.readdir(this.path);
    let wordLocalPaths = paths.filter((path) => path.endsWith(".nxdw"));
    this.size = wordLocalPaths.length;
    let promises = wordLocalPaths.map((wordLocalPath) => {
      let wordPath = joinPath(this.path, wordLocalPath);
      return this.loadWord(wordPath);
    });
    let words = await Promise.all(promises);
    return words;
  }

  private async loadWord(path: string): Promise<Word> {
    let string = await fs.readFile(path, {encoding: "utf-8"});
    let word = Word.fromString(string);
    this.count ++;
    this.emitProgress();
    return word;
  }

  private async loadSettings(): Promise<DictionarySettings> {
    let path = joinPath(this.path, "$SETTINGS.nxds");
    let string = await fs.readFile(path, {encoding: "utf-8"});
    let settings = DictionarySettings.fromString(string);
    this.emitProgress();
    return settings;
  }

  private async loadMarkers(): Promise<Markers> {
    let path = joinPath(this.path, "$MARKER.nxds");
    let string = await fs.readFile(path, {encoding: "utf-8"});
    let markers = Markers.fromString(string);
    this.emitProgress();
    return markers;
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}