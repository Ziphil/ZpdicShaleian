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
  Saver
} from "./saver";


export class DirectorySaver extends Saver {

  private size: number = 0;
  private count: number = 0;
  private deleteSize: number = 0;
  private deleteCount: number = 0;
  private settingsSaved: boolean = false;
  private markersSaved: boolean = false;

  public constructor(dictionary: Dictionary, path?: string | null) {
    super(dictionary, path);
  }

  public start(): void {
    this.deleteOlds();
  }

  private deleteOlds(): void {
    this.size = this.dictionary.words.length;
    fs.readdir(this.path, (error, paths) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          let oldLocalPaths = paths.filter((path) => path.endsWith(".nxdw") || path.endsWith(".nxds"));
          this.deleteSize = oldLocalPaths.length;
          for (let oldLocalPath of oldLocalPaths) {
            let oldPath = path.join(this.path, oldLocalPath);
            this.deleteOld(oldPath);
          }
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private deleteOld(path: string): void {
    fs.unlink(path, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.deleteCount ++;
        this.emitProgress();
        this.checkDeleteEnded();
      }
    });
  }

  private saveWords(): void {
    let dictionary = this.dictionary;
    let words = this.dictionary.words;
    fs.mkdir(this.path, {recursive: true}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          for (let word of words) {
            let wordPath = path.join(this.path, word.getFileName() + ".nxdw");
            this.saveWord(word, wordPath);
          }
          let settingsPath = path.join(this.path, "$SETTINGS.nxds");
          let markersPath = path.join(this.path, "$MARKER.nxds");
          this.saveSettings(dictionary.settings, settingsPath);
          this.saveMarkers(dictionary.markers, markersPath);
        } catch (error) {
          this.emit("error", error);
        }
      }
    });
  }

  private saveWord(word: Word, path: string): void {
    let string = word.toString();
    fs.writeFile(path, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.count ++;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private saveSettings(settings: DictionarySettings, path: string): void {
    let string = settings.toString();
    fs.writeFile(path, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.settingsSaved = true;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private saveMarkers(markers: Markers, path: string): void {
    let string = markers.toString();
    fs.writeFile(path, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.markersSaved = true;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private checkDeleteEnded(): void {
    if (this.deleteCount >= this.deleteSize) {
      this.saveWords();
    }
  }

  private checkEnded(): void {
    if (this.count >= this.size && this.settingsSaved && this.markersSaved) {
      this.emit("end");
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count + this.deleteCount, this.size + this.deleteSize);
  }

}