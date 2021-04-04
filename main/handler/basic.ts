//

import {
  BrowserWindowConstructorOptions,
  IpcMainEvent,
  OpenDialogOptions,
  OpenDialogReturnValue,
  dialog
} from "electron";
import {
  Settings
} from "../../renderer/module/settings";
import {
  Main
} from "../index";
import {
  handler,
  on,
  onAsync
} from "./decorator";
import {
  Handler
} from "./handler";


@handler()
export class BasicHandler extends Handler {

  @onAsync("get-props")
  private async getProps(this: Main, event: IpcMainEvent, id: number): Promise<object> {
    let props = this.props.get(id);
    if (props !== undefined) {
      this.props.delete(id);
      return props;
    } else {
      return {};
    }
  }

  @on("show-window")
  private showWindow(this: Main, event: IpcMainEvent, id: number): void {
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.show();
      let mainWindow = this.mainWindow;
      if (mainWindow !== undefined) {
        mainWindow.focus();
        window.focus();
      }
    }
  }

  @on("close-window")
  private closeWindow(this: Main, event: IpcMainEvent, id: number): void {
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.close();
    }
  }

  @on("destroy-window")
  private destroyWindow(this: Main, event: IpcMainEvent, id: number): void {
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.destroy();
    }
  }

  @on("create-window")
  private createWindow(this: Main, event: IpcMainEvent, mode: string, parentId: number | null, props: object, options: BrowserWindowConstructorOptions): void {
    this.createWindow(mode, parentId, props, options);
  }

  @onAsync("get-settings")
  private async getSettings(this: Main, event: IpcMainEvent): Promise<Settings> {
    return this.settings;
  }

  @onAsync("change-settings")
  private async changeSettings<K extends keyof Settings>(this: Main, event: IpcMainEvent, key: K, value: Settings[K]): Promise<void> {
    this.settings[key] = value;
  }

  @on("open-dev-tools")
  private openDevTools(this: Main, event: IpcMainEvent, id: number): void {
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.webContents.openDevTools();
    }
  }

  @onAsync("show-open-dialog")
  private async showOpenDialog(this: Main, event: IpcMainEvent, id: number, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    let window = this.windows.get(id);
    if (window !== undefined) {
      return await dialog.showOpenDialog(window, options);
    } else {
      return await dialog.showOpenDialog(options);
    }
  }

  @onAsync("get-packaged")
  private async getPackaged(this: Main, event: IpcMainEvent): Promise<boolean> {
    return this.app.isPackaged;
  }

}