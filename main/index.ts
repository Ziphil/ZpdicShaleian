//

import {
  App,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app as electronApp,
  ipcMain
} from "electron";
import {
  client
} from "electron-connect";
import {
  join as joinPath
} from "path";


const COMMON_WINDOW_OPTIONS = {
  resizable: true,
  fullscreenable: false,
  autoHideMenuBar: true,
  acceptFirstMouse: true,
  useContentSize: true,
  webPreferences: {nodeIntegration: true, contextIsolation: false, devTools: true}
};
const PRODUCTION_WINDOW_OPTIONS = {
  webPreferences: {nodeIntegration: true, contextIsolation: false, devTools: false}
};


class Main {

  private app: App;
  private windows: Map<string, BrowserWindow>;
  private props: Map<string, object>;

  public constructor(app: App) {
    this.app = app;
    this.windows = new Map();
    this.props = new Map();
  }

  public main(): void {
    this.setupEventHandlers();
    this.setupIpc();
  }

  private setupEventHandlers(): void {
    this.app.on("ready", () => {
      this.createMainWindow();
    });
    this.app.on("activate", () => {
      if (this.windows.size <= 0) {
        this.createMainWindow();
      }
    });
    this.app.on("window-all-closed", () => {
      this.app.quit();
    });
  }

  private setupIpc(): void {
    ipcMain.on("ready-get-props", (event, id) => {
      let props = this.props.get(id);
      if (props !== undefined) {
        event.reply("get-props", this.props.get(id));
        this.props.delete(id);
      } else {
        console.error("props undefined");
      }
    });
    ipcMain.on("ready-show", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.show();
      }
    });
    ipcMain.on("create-window", (event, mode, parentId, props, options) => {
      this.createWindow(mode, parentId, props, options);
    });
  }

  private createWindow(mode: string, parentId: string | null, props: object, options: BrowserWindowConstructorOptions): BrowserWindow {
    let show = false;
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let additionalOptions = (this.isDevelopment()) ? {} : PRODUCTION_WINDOW_OPTIONS;
    let window = new BrowserWindow({...COMMON_WINDOW_OPTIONS, ...additionalOptions, show, parent, ...options});
    let id = window.id.toString();
    window.loadFile(joinPath(__dirname, "index.html"), {query: {id, mode}});
    window.once("closed", () => {
      this.windows.delete(id);
    });
    if (!this.isDevelopment()) {
      window.setMenu(null);
    }
    this.windows.set(id, window);
    this.props.set(id, props);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 640, height: 640, minWidth: 640, minHeight: 640};
    let window = this.createWindow("main", null, {}, options);
    this.connectReloadClient(window);
    return window;
  }

  private connectReloadClient(window: BrowserWindow): void {
    if (this.isDevelopment()) {
      client.create(window, {}, () => {
        console.log("Reload client connected");
      });
    }
  }

  private isDevelopment(): boolean {
    return process.env["NODE_ENV"] === "development";
  }

}


let main = new Main(electronApp);
main.main();