//

import {
  IpcRendererEvent,
  contextBridge,
  ipcRenderer
} from "electron";


function send(channel: string, ...args: Array<any>): void {
  ipcRenderer.send(channel, ...args);
}

function on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void {
  ipcRenderer.on(channel, listener);
}

contextBridge.exposeInMainWorld("api", {send, on});