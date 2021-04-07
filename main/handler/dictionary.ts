//

import axios from "axios";
import {
  IpcMainEvent
} from "electron";
import {
  promises as fs
} from "fs";
import {
  Dictionary,
  PlainDictionary,
  PlainDictionarySettings,
  PlainWord
} from "../../renderer/module/dictionary";
import {
  DirectoryLoader
} from "../../renderer/module/dictionary/loader";
import {
  DirectorySaver,
  OldShaleianSaver
} from "../../renderer/module/dictionary/saver";
import {
  Main
} from "../index";
import {
  handler,
  on,
  onAsync
} from "./decorator";
import {
  Handler
} from "./handler";


@handler()
export class DictionaryHandler extends Handler {

  @onAsync("load-dictionary")
  private async loadDictionary(this: Main, event: IpcMainEvent, path: string): Promise<PlainDictionary> {
    let loader = new DirectoryLoader(path);
    let promise = new Promise<PlainDictionary>((resolve, reject) => {
      loader.on("progress", (offset, size) => {
        this.ipcMain.send("get-load-dictionary-progress", event.sender, {offset, size});
      });
      loader.on("end", (dictionary) => {
        resolve(dictionary.toPlain());
      });
      loader.on("error", (error) => {
        console.error(error);
        reject(error);
      });
      loader.start();
    });
    return promise;
  }

  @onAsync("save-dictionary")
  private saveDictionary(this: Main, event: IpcMainEvent, plainDictionary: PlainDictionary, path: string | null): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    let saver = new DirectorySaver(dictionary, path);
    let promise = new Promise<void>((resolve, reject) => {
      saver.on("progress", (offset, size) => {
        this.ipcMain.send("get-save-dictionary-progress", event.sender, {offset, size});
      });
      saver.on("end", () => {
        resolve();
      });
      saver.on("error", (error) => {
        console.error(error);
        reject(error);
      });
      saver.start();
    });
    return promise;
  }

  @onAsync("export-dictionary")
  private exportDictionary(this: Main, event: IpcMainEvent, plainDictionary: PlainDictionary, path: string, type: string): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    let saver = (() => {
      if (type === "oldShaleian") {
        return new OldShaleianSaver(dictionary, path);
      } else {
        return undefined;
      }
    })();
    if (saver !== undefined) {
      let promise = new Promise<void>((resolve, reject) => {
        saver!.on("progress", (offset, size) => {
          this.ipcMain.send("get-export-dictionary-progress", event.sender, {offset, size});
        });
        saver!.on("end", () => {
          resolve();
        });
        saver!.on("error", (error) => {
          console.error(error);
          reject(error);
        });
        saver!.start();
      });
      return promise;
    } else {
      throw new Error("no such saver");
    }
  }

  @onAsync("validate-edit-word")
  private async validateEditWord(this: Main, event: IpcMainEvent, uid: string, word: PlainWord): Promise<string | null> {
    let window = this.mainWindow;
    if (window !== undefined) {
      let errorType = await this.ipcMain.sendAsync("do-validate-edit-word", window.webContents, uid, word);
      return errorType;
    } else {
      return "";
    }
  }

  @onAsync("upload-dictionary")
  private async uploadDictionary(this: Main, event: IpcMainEvent, plainDictionary: PlainDictionary): Promise<void> {
    let password = this.settings.uploadDictionaryPassword;
    if (password !== undefined) {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let tempPath = (this.app.isPackaged) ? "./temp.xdc" : "./dist/temp.xdc";
      let url = "http://ziphil.com/program/interface/1.cgi";
      let saver = new OldShaleianSaver(dictionary, tempPath);
      let saverPromise = new Promise<void>((resolve, reject) => {
        saver.on("end", () => {
          resolve();
        });
        saver.on("error", (error) => {
          console.error(error);
          reject(error);
        });
        saver.start();
      });
      await saverPromise;
      let content = await fs.readFile(tempPath, {encoding: "utf-8"});
      let params = new URLSearchParams();
      params.append("mode", "zpdic");
      params.append("password", password);
      params.append("content", content);
      await axios.post(url, params);
    } else {
      throw new Error("password unspecified");
    }
  }

}