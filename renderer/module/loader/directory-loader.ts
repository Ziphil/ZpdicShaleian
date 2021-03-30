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
  Markers
} from "../marker";
import {
  Word
} from "../word";
import {
  Loader
} from "./loader";


export class DirectoryLoader extends Loader {

  private words: Array<Word>;
  private settings: DictionarySettings;
  private markers: Markers;
  private size: number = 0;
  private count: number = 0;
  private settingsLoaded: boolean = false;
  private markersLoaded: boolean = false;

  public constructor(path: string) {
    super(path);
    this.words = [];
    this.settings = DictionarySettings.createEmpty();
    this.markers = new Markers();
  }

  public start(): void {
    this.loadWords();
  }

  private loadWords(): void {
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
          let markersPath = path.join(this.path, "$MARKER.nxds");
          this.loadSettings(settingsPath);
          this.loadMarkers(markersPath);;
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private loadWord(path: string): void {
    fs.readFile(path, {encoding: "utf-8"}, (error, string) => {
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

  private loadSettings(path: string): void {
    fs.readFile(path, {encoding: "utf-8"}, (error, string) => {
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

  private loadMarkers(path: string): void {
    fs.readFile(path, {encoding: "utf-8"}, (error, string) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          let markers = Markers.fromString(string);
          this.markers = markers;
          this.markersLoaded = true;
          this.checkEnded();
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private checkEnded(): void {
    if (this.count >= this.size && this.settingsLoaded && this.markersLoaded) {
      try {
        let words = this.words;
        let settings = this.settings;
        let markers = this.markers;
        let path = this.path;
        let dictionary = new Dictionary(words, settings, markers, path);
        this.emit("end", dictionary);
      } catch (error) {
        this.emit("error", error);
      }
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}