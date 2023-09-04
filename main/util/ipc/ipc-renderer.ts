//

import {
  IpcRendererEvent,
  ipcRenderer as electronIpcRenderer
} from "electron";
import {
  deserializeError,
  serializeError
} from "serialize-error";
import {
  v4 as uuid
} from "uuid";


export class PromisifiedIpcRenderer {

  public send(channel: string, ...args: Array<any>): void {
    electronIpcRenderer.send(channel, ...args);
  }

  public sendAsync(channel: string, ...args: Array<any>): Promise<any> {
    const replyChannel = channel + uuid();
    const promise = new Promise((resolve, reject) => {
      electronIpcRenderer.once(replyChannel, (event, exitCode, data) => {
        if (exitCode !== 0) {
          reject(deserializeError(data));
        } else {
          resolve(data);
        }
      });
      electronIpcRenderer.send(channel, replyChannel, ...args);
    });
    return promise;
  }

  public sendTo(id: number, channel: string, ...args: Array<any>): void {
    electronIpcRenderer.sendTo(id, channel, ...args);
  }

  public on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void {
    electronIpcRenderer.on(channel, listener);
  }

  public onAsync(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => Promise<any>): void {
    electronIpcRenderer.on(channel, (event, replyChannel, ...args) => {
      listener(event, ...args).then((data) => {
        event.sender.send(replyChannel, 0, data);
      }).catch((error) => {
        event.sender.send(replyChannel, 1, serializeError(error));
      });
    });
  }

  public once(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void {
    electronIpcRenderer.once(channel, listener);
  }

}


export const ipcRenderer = new PromisifiedIpcRenderer();