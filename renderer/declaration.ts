//

import {
  PromisifiedIpcRenderer
} from "../main/util/ipc/ipc-renderer";


declare global {

  class WindowApi {
    public send: PromisifiedIpcRenderer["send"];
    public sendAsync: PromisifiedIpcRenderer["sendAsync"];
    public sendTo: PromisifiedIpcRenderer["sendTo"];
    public on: PromisifiedIpcRenderer["on"];
    public onAsync: PromisifiedIpcRenderer["onAsync"];
    public once: PromisifiedIpcRenderer["once"];
  }

  interface Window {
    api: WindowApi;
  }

}