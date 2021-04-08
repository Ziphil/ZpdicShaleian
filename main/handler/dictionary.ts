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
  handler,
  on,
  onAsync
} from "./decorator";
import {
  Handler
} from "./handler";


@handler()
export class DictionaryHandler extends Handler {

  @onAsync("loadDictionary")
  private async loadDictionary(event: IpcMainEvent, path: string): Promise<PlainDictionary> {
    let loader = new DirectoryLoader(path);
    let promise = new Promise<PlainDictionary>((resolve, reject) => {
      loader.on("progress", (offset, size) => {
        this.send("getLoadDictionaryProgress", event.sender, {offset, size});
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

  @onAsync("saveDictionary")
  private saveDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string | null): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    let saver = new DirectorySaver(dictionary, path);
    let promise = new Promise<void>((resolve, reject) => {
      saver.on("progress", (offset, size) => {
        this.send("getSaveDictionaryProgress", event.sender, {offset, size});
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

  @onAsync("exportDictionary")
  private exportDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string, type: string): Promise<void> {
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
          this.send("getExportDictionaryProgress", event.sender, {offset, size});
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

  @onAsync("validateEditWord")
  private async validateEditWord(event: IpcMainEvent, uid: string, word: PlainWord): Promise<string | null> {
    let window = this.main.mainWindow;
    if (window !== undefined) {
      let errorType = await this.sendAsync("doValidateEditWord", window.webContents, uid, word);
      return errorType;
    } else {
      return "";
    }
  }

  @onAsync("uploadDictionary")
  private async uploadDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary): Promise<void> {
    let url = this.main.settings.uploadDictionaryUrl;
    let password = this.main.settings.uploadDictionaryPassword;
    if (url !== undefined && password !== undefined) {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let tempPath = (this.main.app.isPackaged) ? "./temp.xdc" : "./dist/temp.xdc";
      let saver = new OldShaleianSaver(dictionary, tempPath);
      let saverPromise = new Promise<void>((resolve, reject) => {
        saver.on("progress", (offset, size) => {
          let ratio = (size > 0) ? (offset / size) / 2 : 0;
          this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
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
      await saverPromise;
      let content = await fs.readFile(tempPath, {encoding: "utf-8"});
      let params = new URLSearchParams();
      params.append("mode", "zpdic");
      params.append("password", password);
      params.append("content", content);
      this.send("getUploadDictionaryProgress", event.sender, {offset: 0.5, size: 1});
      await axios.post(url, params);
      await fs.unlink(tempPath);
    } else {
      throw new Error("password unspecified");
    }
  }

}