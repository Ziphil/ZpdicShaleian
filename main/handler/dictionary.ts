//

import {
  IpcMainEvent
} from "electron";
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
  DirectorySaver
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
  private async saveDictionary(this: Main, event: IpcMainEvent, plainDictionary: PlainDictionary, path: string | null): Promise<void> {
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

  @on("ready-edit-word")
  private readyEditWord(this: Main, event: IpcMainEvent, uid: string, word: PlainWord): void {
    let window = this.mainWindow;
    if (window !== undefined) {
      this.ipcMain.send("edit-word", window.webContents, uid, word);
    }
  }

  @on("ready-delete-word")
  private readyDeleteWord(this: Main, event: IpcMainEvent, uid: string): void {
    let window = this.mainWindow;
    if (window !== undefined) {
      this.ipcMain.send("delete-word", window.webContents, uid);
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

  @on("ready-change-dictionary-settings")
  private readyChangeDictionarySettings(this: Main, event: IpcMainEvent, settings: PlainDictionarySettings): void {
    let window = this.mainWindow;
    if (window !== undefined) {
      this.ipcMain.send("change-dictionary-settings", window.webContents, settings);
    }
  }

}