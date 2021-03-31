//

import {
  IpcRendererEvent
} from "electron";


declare global {

  class WindowApi {
    public send(channel: string, ...args: Array<any>): void;
    public sendAsync(channel: string, ...args: Array<any>): Promise<any>;
    public on(channel: string, listener: (event: IpcRendererEvent, ...args: Array<any>) => void): void;
    public onAsync(channel: string, listener: (...args: Array<any>) => void): void;
  }

  interface Window {
    api: WindowApi;
  }

}