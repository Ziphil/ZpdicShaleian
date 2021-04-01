//

import {
  contextBridge
} from "electron";
import {
  ipcRenderer
} from "./util/ipc/ipc-renderer";


let send = ipcRenderer.send.bind(ipcRenderer);
let sendAsync = ipcRenderer.sendAsync.bind(ipcRenderer);
let on = ipcRenderer.on.bind(ipcRenderer);
let onAsync = ipcRenderer.onAsync.bind(ipcRenderer);

contextBridge.exposeInMainWorld("api", {send, sendAsync, on, onAsync});