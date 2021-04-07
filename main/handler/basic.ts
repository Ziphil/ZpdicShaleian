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
  private async getProps(event: IpcMainEvent): Promise<object> {
    let id = event.sender.id;
    let props = this.main.props.get(id);
    if (props !== undefined) {
      this.main.props.delete(id);
      return props;
    } else {
      return {};
    }
  }

  @on("show-window")
  private showWindow(event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      window.show();
      let mainWindow = this.main.mainWindow;
      if (mainWindow !== undefined) {
        mainWindow.focus();
        window.focus();
      }
    }
  }

  @on("close-window")
  private closeWindow(event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      window.close();
    }
  }

  @on("destroy-window")
  private destroyWindow(event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      window.destroy();
    }
  }

  @on("create-window")
  private createWindow(event: IpcMainEvent, mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    let parentId = event.sender.id;
    this.main.createWindow(mode, parentId, props, options);
  }

  @onAsync("get-settings")
  private async getSettings(event: IpcMainEvent): Promise<Settings> {
    return this.main.settings;
  }

  @onAsync("change-settings")
  private async changeSettings<K extends keyof Settings>(event: IpcMainEvent, key: K, value: Settings[K]): Promise<void> {
    this.main.settings[key] = value;
  }

  @on("open-dev-tools")
  private openDevTools(event: IpcMainEvent): void {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      window.webContents.openDevTools();
    }
  }

  @onAsync("show-open-dialog")
  private async showOpenDialog(event: IpcMainEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      return await dialog.showOpenDialog(window, options);
    } else {
      return await dialog.showOpenDialog(options);
    }
  }

  @onAsync("show-save-dialog")
  private async showSaveDialog(event: IpcMainEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    let id = event.sender.id;
    let window = this.main.windows.get(id);
    if (window !== undefined) {
      return await dialog.showSaveDialog(window, options);
    } else {
      return await dialog.showSaveDialog(options);
    }
  }

  @onAsync("get-packaged")
  private async getPackaged(event: IpcMainEvent): Promise<boolean> {
    return this.main.app.isPackaged;
  }

}