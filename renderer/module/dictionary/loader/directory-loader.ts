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
    let othersPromise = this.loadOthers();
    let [words, [settings, markers]] = await Promise.all([wordsPromise, othersPromise]);
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

  private async loadOthers(): Promise<[DictionarySettings, Markers]> {
    let paths = await fs.readdir(this.path);
    let otherLocalPaths = paths.filter((path) => path.endsWith(".xdns"));
    let settingsPath = null as string | null;
    let markersPath = null as string | null;
    let promises = otherLocalPaths.map(async (otherLocalPath) => {
      let otherPath = joinPath(this.path, otherLocalPath);
      let string = await fs.readFile(otherPath, {encoding: "utf-8"});
      if (string.includes("!VERSION")) {
        settingsPath = otherPath;
      } else if (string.includes("!MARKER")) {
        markersPath = otherPath;
      }
    });
    await Promise.all(promises);
    let settingsPromise = this.loadSettings(settingsPath);
    let markersPromise = this.loadMarkers(markersPath);
    let [settings, markers] = await Promise.all([settingsPromise, markersPromise]);
    return [settings, markers];
  }

  private async loadSettings(path: string | null): Promise<DictionarySettings> {
    if (path !== null) {
      let string = await fs.readFile(path, {encoding: "utf-8"});
      let settings = this.deserializer.deserializeDictionarySettings(string);
      this.emitProgress();
      return settings;
    } else {
      return DictionarySettings.createEmpty();
    }
  }

  private async loadMarkers(path: string | null): Promise<Markers> {
    if (path !== null) {
      let string = await fs.readFile(path, {encoding: "utf-8"});
      let markers = this.deserializer.deserializeMarkers(string);
      this.emitProgress();
      return markers;
    } else {
      return Markers.createEmpty();
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}