//

import axios from "axios";
import {
  IpcMainEvent
} from "electron";
import execa from "execa";
import FormData from "form-data";
import {
  createReadStream,
  promises as fs
} from "fs";
import {
  Dictionary,
  PlainDictionary,
  PlainWord
} from "soxsot";
import {
  DictionaryFormatBuilder
} from "soxsot-format";
import {
  DirectoryLoader,
  DirectorySaver,
  SaverCreator,
  SaverKind,
  SingleSaver
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
  private async exportDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string, kind: SaverKind | "pdf"): Promise<void> {
    let dictionary = Dictionary.fromPlain(plainDictionary);
    if (kind === "pdf") {
      let builder = new DictionaryFormatBuilder("ja");
      let xslPath = path.replace(/\.\w+$/, ".fo");
      await fs.writeFile(xslPath, builder.convert(dictionary), {encoding: "utf-8"});
      await execa("AHFCmd", ["-x", "3", "-d", xslPath, "-p", "@PDF", "-o", path]);
      await fs.unlink(xslPath);
    } else {
      let saver = SaverCreator.createByKind(kind, dictionary, path);
      if (saver !== undefined) {
        await saver.asPromise({onProgress: (offset, size) => {
          this.send("getExportDictionaryProgress", event.sender, {offset, size});
        }});
      } else {
        throw new Error("no such saver");
      }
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
      let saver = new SingleSaver(dictionary, tempPath);
      await saver.asPromise({onProgress: (offset, size) => {
        let ratio = (size > 0) ? (offset / size) / 2 : 0;
        this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
      }});
      this.send("getUploadDictionaryProgress", event.sender, {offset: 0.5, size: 1});
      let formData = new FormData();
      let file = createReadStream(tempPath);
      formData.append("password", password);
      formData.append("file", file);
      await axios.post(url, formData, {headers: formData.getHeaders(), onUploadProgress: (event) => {
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