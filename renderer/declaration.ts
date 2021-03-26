//

import {
  IpcRendererEvent
} from "electron";


declare global {

  class WindowApi {
    public send(channel: string, ...args: Array<any>): void;
    public on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void;
  }

  interface Window {
    api: WindowApi;
  }

}