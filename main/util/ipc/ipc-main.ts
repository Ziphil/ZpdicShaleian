//

import {
  IpcMainEvent,
  WebContents,
  ipcMain as electronIpcMain
} from "electron";
import {
  deserializeError,
  serializeError
} from "serialize-error";
import {
  v4 as uuid
} from "uuid";


export class PromisifiedIpcMain {

  public send(channel: string, webContents: WebContents, ...args: Array<any>): void {
    webContents.send(channel, ...args);
  }

  public sendAsync(channel: string, webContents: WebContents, ...args: Array<any>): Promise<any> {
    const replyChannel = channel + uuid();
    const promise = new Promise((resolve, reject) => {
      electronIpcMain.once(replyChannel, (event, exitCode, data) => {
        if (exitCode !== 0) {
          reject(deserializeError(data));
        } else {
          resolve(data);
        }
      });
      webContents.send(channel, replyChannel, ...args);
    });
    return promise;
  }

  public on(channel: string, listener: (event: IpcMainEvent, ...args: Array<any>) => any): void {
    electronIpcMain.on(channel, listener);
  }

  public onAsync(channel: string, listener: (event: IpcMainEvent, ...args: Array<any>) => Promise<any>): void {
    electronIpcMain.on(channel, (event, replyChannel, ...args) => {
      listener(event, ...args).then((data) => {
        event.sender.send(replyChannel, 0, data);
      }).catch((error) => {
        event.sender.send(replyChannel, 1, serializeError(error));
      });
    });
  }

  public once(channel: string, listener: (event: IpcMainEvent, ...args: Array<any>) => any): void {
    electronIpcMain.once(channel, listener);
  }

}


export const ipcMain = new PromisifiedIpcMain();