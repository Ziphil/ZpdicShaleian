//

import {
  PromisifiedIpcRenderer
} from "../main/util/ipc/ipc-renderer";


declare global {

  class WindowApi {
    public send: PromisifiedIpcRenderer["send"];
    public sendAsync: PromisifiedIpcRenderer["sendAsync"];
    public on: PromisifiedIpcRenderer["on"];
    public onAsync: PromisifiedIpcRenderer["onAsync"];
  }

  interface Window {
    api: WindowApi;
  }

}