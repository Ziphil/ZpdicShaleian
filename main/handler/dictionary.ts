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
} from "soxsot";
import {
  DirectoryLoader,
  DirectorySaver,
  OldShaleianSaver,
  SaverCreator,
  SaverKind
} from "soxsot/dist/io";
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
    let dictionary = await loader.asPromise({onProgress: (offset, size) => {
      this.send("getLoadDictionaryProgress", event.sender, {offset, size});
    }});
    if (dictionary.path !== null) {
      this.main.settings.defaultDictionaryPath = dictionary.path;
    }
    return dictionary.toPlain();
  }

  @onAsync("saveDictionary")
  private async saveDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string | null): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    let saver = new DirectorySaver(dictionary, path);
    await saver.asPromise({onProgress: (offset, size) => {
      this.send("getSaveDictionaryProgress", event.sender, {offset, size});
    }});
  }

  @onAsync("exportDictionary")
  private async exportDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string, kind: SaverKind): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    let saver = SaverCreator.createByKind(kind, dictionary, path);
    if (saver !== undefined) {
      await saver.asPromise({onProgress: (offset, size) => {
        this.send("getExportDictionaryProgress", event.sender, {offset, size});
      }});
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
  private async uploadDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, url: string, password: string): Promise<void> {
    if (url !== "" && password !== "") {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let tempPath = (this.main.app.isPackaged) ? "./temp.xdc" : "./dist/temp.xdc";
      let saver = new OldShaleianSaver(dictionary, tempPath);
      await saver.asPromise({onProgress: (offset, size) => {
        let ratio = (size > 0) ? (offset / size) / 2 : 0;
        this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
      }});
      this.send("getUploadDictionaryProgress", event.sender, {offset: 0.5, size: 1});
      let content = await fs.readFile(tempPath, {encoding: "utf-8"});
      let params = new URLSearchParams({mode: "zpdic", password, content});
      await axios.post(url, params, {onUploadProgress: (event) => {
        if (event.lengthComputable) {
          let ratio = (event.total > 0) ? (event.loaded / event.total) / 2 + 0.5 : 0.5;
          this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
        }
      }});
      await fs.unlink(tempPath);
    } else {
      throw new Error("password unspecified");
    }
  }

}