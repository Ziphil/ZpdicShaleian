//

import {
  BrowserWindowConstructorOptions,
  IpcMainEvent,
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
  dialog,
  shell
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

  @onAsync("getProps")
  private async getProps(event: IpcMainEvent): Promise<object> {
    const id = event.sender.id;
    const props = this.main.props.get(id);
    if (props !== undefined) {
      this.main.props.delete(id);
      return props;
    } else {
      return {};
    }
  }

  @on("showWindow")
  private showWindow(event: IpcMainEvent): void {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      window.show();
      const mainWindow = this.main.mainWindow;
      if (mainWindow !== undefined) {
        mainWindow.focus();
        window.focus();
      }
    }
  }

  @on("closeWindow")
  private closeWindow(event: IpcMainEvent): void {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      window.close();
    }
  }

  @on("destroyWindow")
  private destroyWindow(event: IpcMainEvent): void {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      window.destroy();
    }
  }

  @on("createWindow")
  private createWindow(event: IpcMainEvent, mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    const parentId = event.sender.id;
    this.main.createWindow(mode, parentId, props, options);
  }

  @onAsync("getSettings")
  private async getSettings(event: IpcMainEvent): Promise<Settings> {
    return this.main.settings;
  }

  @onAsync("changeSettings")
  private async changeSettings<K extends keyof Settings>(event: IpcMainEvent, key: K, value: Settings[K]): Promise<void> {
    this.main.settings[key] = value;
  }

  @on("openDevTools")
  private openDevTools(event: IpcMainEvent): void {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      window.webContents.openDevTools();
    }
  }

  @onAsync("showOpenDialog")
  private async showOpenDialog(event: IpcMainEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      return await dialog.showOpenDialog(window, options);
    } else {
      return await dialog.showOpenDialog(options);
    }
  }

  @onAsync("showSaveDialog")
  private async showSaveDialog(event: IpcMainEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    const id = event.sender.id;
    const window = this.main.windows.get(id);
    if (window !== undefined) {
      return await dialog.showSaveDialog(window, options);
    } else {
      return await dialog.showSaveDialog(options);
    }
  }

  @on("showItemInFolder")
  private showItemInFolder(event: IpcMainEvent, path: string): void {
    shell.showItemInFolder(path);
  }

  @on("showItem")
  private showItem(event: IpcMainEvent, path: string): void {
    shell.openPath(path);
  }

  @onAsync("getPackaged")
  private async getPackaged(event: IpcMainEvent): Promise<boolean> {
    return this.main.app.isPackaged;
  }

}