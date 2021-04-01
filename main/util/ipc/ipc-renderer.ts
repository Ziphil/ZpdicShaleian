//

import {
  IpcRenderer,
  IpcRendererEvent,
  ipcRenderer as electronIpcRenderer
} from "electron";
import {
  serializeError
} from "serialize-error";
import {
  v4 as uuid
} from "uuid";


export class PromisifiedIpcRenderer {

  public readonly electronIpcRenderer: IpcRenderer;

  public constructor(electronIpcRenderer: IpcRenderer) {
    this.electronIpcRenderer = electronIpcRenderer;
  }

  public send(channel: string, ...args: Array<any>): void {
    this.electronIpcRenderer.send(channel, ...args);
  }

  public sendAsync(channel: string, ...args: Array<any>): Promise<any> {
    let replyChannel = channel + uuid();
    let promise = new Promise((resolve, reject) => {
      this.electronIpcRenderer.once(replyChannel, (event, exitCode, returnedData) => {
        if (exitCode !== 0) {
          reject(returnedData);
        } else {
          resolve(returnedData);
        }
      });
      this.electronIpcRenderer.send(channel, replyChannel, ...args);
    });
    return promise;
  }

  public on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void {
    this.electronIpcRenderer.on(channel, listener);
  }

  public onAsync(channel: string, listener: (...args: Array<any>) => Promise<any>) {
    this.electronIpcRenderer.on(channel, (event, replyChannel, ...args) => {
      Promise.resolve().then(() => listener(...args)).then((result) => {
        event.sender.send(replyChannel, 0, result);
      }).catch((error) => {
        event.sender.send(replyChannel, 1, serializeError(error));
      });
    });
  }

}


export let ipcRenderer = new PromisifiedIpcRenderer(electronIpcRenderer);