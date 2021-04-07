//

import {
  WebContents
} from "electron";
import {
  Main
} from "../index";
import {
  ipcMain
} from "../util/ipc/ipc-main";


export class Handler {

  protected main: Main;

  public constructor(main: Main) {
    this.main = main;
  }

  protected setup(): void {
  }

  protected send(channel: string, webContents: WebContents, ...args: Array<any>): void {
    return ipcMain.send(channel, webContents, ...args);
  }

  protected sendAsync(channel: string, webContents: WebContents, ...args: Array<any>): Promise<any> {
    return ipcMain.sendAsync(channel, webContents, ...args);
  }

  public static setup<H extends Handler>(this: new(main: Main) => H, main: Main): H {
    let controller = new this(main);
    controller.setup();
    return controller;
  }

}