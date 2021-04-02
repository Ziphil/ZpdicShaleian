//

import {
  Main
} from "../index";
import {
  PromisifiedIpcMain
} from "../util/ipc/ipc-main";


export class Handler {

  protected setup(main: Main): void {
  }

  public static setup<H extends Handler>(this: new() => H, main: Main): H {
    let controller = new this();
    controller.setup(main);
    return controller;
  }

}