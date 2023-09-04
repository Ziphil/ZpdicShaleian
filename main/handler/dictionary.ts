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
  DirectoryDiffSaver,
  DirectoryLoader,
  SaverCreator,
  SaverKind,
  SingleSaver
} from "soxsot/dist/io";
import {
  DictionaryFormatBuilder
} from "soxsot-format";
import {
  handler,
  onAsync
} from "./decorator";
import {
  Handler
} from "./handler";


@handler()
export class DictionaryHandler extends Handler {

  @onAsync("loadDictionary")
  private async loadDictionary(event: IpcMainEvent, path: string): Promise<PlainDictionary> {
    const loader = new DirectoryLoader(path);
    const dictionary = await loader.asPromise({onProgress: (offset, size) => {
      this.send("getLoadDictionaryProgress", event.sender, {offset, size});
    }});
    if (dictionary.path !== null) {
      this.main.settings.defaultDictionaryPath = dictionary.path;
    }
    return dictionary.toPlain();
  }

  @onAsync("saveDictionary")
  private async saveDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string | null): Promise<void> {
    const dictionary = Dictionary.fromPlain(plainDictionary);
    const saver = new DirectoryDiffSaver(dictionary, path);
    await saver.asPromise({onProgress: (offset, size) => {
      this.send("getSaveDictionaryProgress", event.sender, {offset, size});
    }});
  }

  @onAsync("exportDictionary")
  private async exportDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, path: string, kind: SaverKind | "pdf"): Promise<void> {
    const dictionary = Dictionary.fromPlain(plainDictionary) as any;
    if (kind === "pdf") {
      const builder = new DictionaryFormatBuilder("ja");
      const xslPath = path.replace(/\.\w+$/, ".fo");
      await fs.writeFile(xslPath, builder.convert(dictionary), {encoding: "utf-8"});
      await execa("AHFCmd", ["-x", "3", "-d", xslPath, "-p", "@PDF", "-o", path]);
      await fs.unlink(xslPath);
    } else {
      const saver = SaverCreator.createByKind(kind, dictionary, path);
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
    const window = this.main.mainWindow;
    if (window !== undefined) {
      const errorType = await this.sendAsync("doValidateEditWord", window.webContents, uid, word);
      return errorType;
    } else {
      return "";
    }
  }

  @onAsync("uploadDictionary")
  private async uploadDictionary(event: IpcMainEvent, plainDictionary: PlainDictionary, url: string, password: string): Promise<void> {
    if (url !== "" && password !== "") {
      const dictionary = Dictionary.fromPlain(plainDictionary);
      const tempPath = (this.main.app.isPackaged) ? "./temp.xdc" : "./dist/temp.xdc";
      const saver = new SingleSaver(dictionary, tempPath);
      await saver.asPromise({onProgress: (offset, size) => {
        const ratio = (size > 0) ? (offset / size) / 2 : 0;
        this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
      }});
      this.send("getUploadDictionaryProgress", event.sender, {offset: 0.5, size: 1});
      const formData = new FormData();
      const file = createReadStream(tempPath);
      formData.append("password", password);
      formData.append("file", file);
      await axios.post(url, formData, {headers: formData.getHeaders(),
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            const ratio = (event.total > 0) ? (event.loaded / event.total) / 2 + 0.5 : 0.5;
            this.send("getUploadDictionaryProgress", event.sender, {offset: ratio, size: 1});
          }
        }});
      await fs.unlink(tempPath);
    } else {
      throw new Error("password unspecified");
    }
  }

}