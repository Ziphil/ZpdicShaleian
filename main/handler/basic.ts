//

import {
  BrowserWindowConstructorOptions,
  IpcMainEvent,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
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
  private async getProps(this: Main, event: IpcMainEvent): Promise<object> {
    let id = event.sender.id;
    let props = this.props.get(id);
    if (props !== undefined) {
      this.props.delete(id);
      return props;
    } else {
      return {};
    }
  }

  @on("show-window")
  private showWindow(this: Main, event: IpcMainEvent): void {
    let id = event.sender.id;
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
  private closeWindow(this: Main, event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.close();
    }
  }

  @on("destroy-window")
  private destroyWindow(this: Main, event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.destroy();
    }
  }

  @on("create-window")
  private createWindow(this: Main, event: IpcMainEvent, mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    let parentId = event.sender.id;
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
  private openDevTools(this: Main, event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.windows.get(id);
    if (window !== undefined) {
      window.webContents.openDevTools();
    }
  }

  @onAsync("show-open-dialog")
  private async showOpenDialog(this: Main, event: IpcMainEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    let id = event.sender.id;
    let window = this.windows.get(id);
    if (window !== undefined) {
      return await dialog.showOpenDialog(window, options);
    } else {
      return await dialog.showOpenDialog(options);
    }
  }

  @onAsync("show-save-dialog")
  private async showSaveDialog(this: Main, event: IpcMainEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    let id = event.sender.id;
    let window = this.windows.get(id);
    if (window !== undefined) {
      return await dialog.showSaveDialog(window, options);
    } else {
      return await dialog.showSaveDialog(options);
    }
  }

  @onAsync("get-packaged")
  private async getPackaged(this: Main, event: IpcMainEvent): Promise<boolean> {
    return this.app.isPackaged;
  }

}