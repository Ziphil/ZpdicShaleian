//

import {
  contextBridge
} from "electron";
import {
  ipcRenderer
} from "./util/ipc/ipc-renderer";


const send = ipcRenderer.send.bind(ipcRenderer);
const sendAsync = ipcRenderer.sendAsync.bind(ipcRenderer);
const sendTo = ipcRenderer.sendTo.bind(ipcRenderer);
const on = ipcRenderer.on.bind(ipcRenderer);
const onAsync = ipcRenderer.onAsync.bind(ipcRenderer);
const once = ipcRenderer.once.bind(ipcRenderer);

contextBridge.exposeInMainWorld("api", {send, sendAsync, sendTo, on, onAsync, once});