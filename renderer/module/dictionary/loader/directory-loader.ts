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
  Deserializer
} from "./deserializer";
import {
  Loader
} from "./loader";


export class DirectoryLoader extends Loader {

  private readonly deserializer: Deserializer;
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
    this.deserializer = new Deserializer();
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
    let wordLocalPaths = paths.filter((path) => path.endsWith(".xdnw"));
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
    let word = this.deserializer.deserializeWord(string);
    this.count ++;
    this.emitProgress();
    return word;
  }

  private async loadSettings(): Promise<DictionarySettings> {
    let path = joinPath(this.path, "#SETTINGS.xdns");
    try {
      let string = await fs.readFile(path, {encoding: "utf-8"});
      let settings = this.deserializer.deserializeDictionarySettings(string);
      this.emitProgress();
      return settings;
    } catch (error) {
      if (error.code === "ENOENT") {
        return DictionarySettings.createEmpty();
      } else {
        throw error;
      }
    }
  }

  private async loadMarkers(): Promise<Markers> {
    let path = joinPath(this.path, "#MARKER.xdns");
    try {
      let string = await fs.readFile(path, {encoding: "utf-8"});
      let markers = this.deserializer.deserializeMarkers(string);
      this.emitProgress();
      return markers;
    } catch (error) {
      if (error.code === "ENOENT") {
        return Markers.createEmpty();
      } else {
        throw error;
      }
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}