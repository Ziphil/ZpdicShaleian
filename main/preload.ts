//

import {
  IpcRendererEvent,
  contextBridge,
  ipcRenderer
} from "electron";
import {
  promiseIpcRenderer
} from "promisify-electron-ipc";


function send(channel: string, ...args: Array<any>): void {
  ipcRenderer.send(channel, ...args);
}

function sendAsync(channel: string, ...args: Array<any>): Promise<any> {
  return promiseIpcRenderer.send(channel, ...args);
}

function on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void {
  ipcRenderer.on(channel, listener);
}

function onAsync(channel: string, listener: (...args: Array<any>) => Promise<any>): void {
  promiseIpcRenderer.on(channel, listener);
}

contextBridge.exposeInMainWorld("api", {send, sendAsync, on, onAsync});