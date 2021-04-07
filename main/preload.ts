//

import {
  contextBridge
} from "electron";
import {
  ipcRenderer
} from "./util/ipc/ipc-renderer";


let send = ipcRenderer.send.bind(ipcRenderer);
let sendAsync = ipcRenderer.sendAsync.bind(ipcRenderer);
let sendTo = ipcRenderer.sendTo.bind(ipcRenderer);
let on = ipcRenderer.on.bind(ipcRenderer);
let onAsync = ipcRenderer.onAsync.bind(ipcRenderer);
let once = ipcRenderer.once.bind(ipcRenderer);

contextBridge.exposeInMainWorld("api", {send, sendAsync, sendTo, on, onAsync, once});