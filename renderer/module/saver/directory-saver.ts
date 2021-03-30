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
  private settingsSaved: boolean = false;
  private markersSaved: boolean = false;

  public constructor(dictionary: Dictionary, path?: string | null) {
    super(dictionary, path);
  }

  public start(): void {
    let dictionary = this.dictionary;
    let words = this.dictionary.words;
    this.size = words.length;
    fs.mkdir(this.path, {recursive: true}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        try {
          for (let word of words) {
            let wordPath = path.join(this.path, word.name + ".nxdw");
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

  private saveWord(word: Word, wordPath: string): void {
    let string = word.toString();
    fs.writeFile(wordPath, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.count ++;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private saveSettings(settings: DictionarySettings, settingsPath: string): void {
    let string = settings.toString();
    fs.writeFile(settingsPath, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.settingsSaved = true;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private saveMarkers(markers: Markers, markersPath: string): void {
    let string = markers.toString();
    fs.writeFile(markersPath, string, {encoding: "utf-8"}, (error) => {
      if (error) {
        this.emit("error", error);
      } else {
        this.markersSaved = true;
        this.emitProgress();
        this.checkEnded();
      }
    });
  }

  private checkEnded(): void {
    if (this.count >= this.size && this.settingsSaved && this.markersSaved) {
      this.emit("end");
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}