//

import {
  IpcMain,
  IpcMainEvent,
  WebContents,
  ipcMain as electronIpcMain
} from "electron";
import {
  serializeError
} from "serialize-error";
import {
  v4 as uuid
} from "uuid";


export class PromisifiedIpcMain {

  public readonly electronIpcMain: IpcMain;

  public constructor(electronIpcMain: IpcMain) {
    this.electronIpcMain = electronIpcMain;
  }

  public send(channel: string, webContents: WebContents, ...args: Array<any>): void {
    webContents.send(channel, ...args);
  }

  public sendAsync(channel: string, webContents: WebContents, ...args: Array<any>): Promise<any> {
    let replyChannel = channel + uuid();
    let promise = new Promise((resolve, reject) => {
      this.electronIpcMain.once(replyChannel, (event, exitCode, returnedData) => {
        if (exitCode !== 0) {
          reject(returnedData);
        } else {
          resolve(returnedData);
        }
      });
      webContents.send(channel, replyChannel, ...args);
    });
    return promise;
  }

  public on(channel: string, listener: (event: IpcMainEvent, ...args: Array<any>) => void): void {
    this.electronIpcMain.on(channel, listener);
  }

  public onAsync(channel: string, listener: (event: IpcMainEvent, ...args: Array<any>) => Promise<any>): void {
    this.electronIpcMain.on(channel, (event, replyChannel, ...args) => {
      listener(event, ...args).then((result) => {
        event.sender.send(replyChannel, 0, result);
      }).catch((error) => {
        event.sender.send(replyChannel, 1, serializeError(error));
      });
    });
  }

}


export let ipcMain = new PromisifiedIpcMain(electronIpcMain);