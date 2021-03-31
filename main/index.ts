//

import {
  App,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
  app as electronApp,
  ipcMain
} from "electron";
import {
  client
} from "electron-connect";
import {
  join as joinPath
} from "path";
import {
  promiseIpcMain
} from "promisify-electron-ipc";
import simpleGit from "simple-git";
import {
  Dictionary
} from "../renderer/module";
import {
  DirectoryLoader
} from "../renderer/module/loader";
import {
  DirectorySaver
} from "../renderer/module/saver";


const COMMON_WINDOW_OPTIONS = {
  resizable: true,
  fullscreenable: false,
  autoHideMenuBar: true,
  acceptFirstMouse: true,
  useContentSize: true,
  webPreferences: {preload: joinPath(__dirname, "preload.js"), devTools: true}
};
const PRODUCTION_WINDOW_OPTIONS = {
  webPreferences: {preload: joinPath(__dirname, "preload.js"), devTools: false}
};


class Main {

  private app: App;
  private windows: Map<number, BrowserWindow>;
  private mainWindow: BrowserWindow | undefined;
  private props: Map<number, object>;

  public constructor(app: App) {
    this.app = app;
    this.windows = new Map();
    this.mainWindow = undefined;
    this.props = new Map();
  }

  public main(): void {
    this.setupEventHandlers();
    this.setupBasicIpc();
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

  private setupBasicIpc(): void {
    ipcMain.on("ready-get-props", (event, id) => {
      let props = this.props.get(id);
      if (props !== undefined) {
        event.reply("get-props", this.props.get(id));
        this.props.delete(id);
      } else {
        event.reply("get-props", {});
      }
    });
    ipcMain.on("ready-show", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.show();
        let mainWindow = this.mainWindow;
        if (mainWindow !== undefined) {
          mainWindow.focus();
          window.focus();
        }
      }
    });
    ipcMain.on("open-dev-tools", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.webContents.openDevTools();
      }
    });
    ipcMain.on("close-window", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.close();
      }
    });
    ipcMain.on("create-window", (event, mode, parentId, props, options) => {
      this.createWindow(mode, parentId, props, options);
    });
  }

  private setupIpc(): void {
    promiseIpcMain.on("show-open-dialog", async (id, options) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        return await dialog.showOpenDialog(window, options);
      } else {
        return await dialog.showOpenDialog(options);
      }
    });
    ipcMain.on("ready-load-dictionary", (event, path) => {
      let loader = new DirectoryLoader(path);
      loader.on("progress", (offset, size) => {
        event.reply("get-load-dictionary-progress", {offset, size});
      });
      loader.on("end", (dictionary) => {
        event.reply("load-dictionary", dictionary);
      });
      loader.on("error", (error) => {
        event.reply("error-load-dictionary", error);
        console.error(error);
      });
      loader.start();
    });
    ipcMain.on("ready-save-dictionary", (event, plainDictionary, path) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let saver = new DirectorySaver(dictionary, path);
      saver.on("progress", (offset, size) => {
        event.reply("get-save-dictionary-progress", {offset, size});
      });
      saver.on("end", () => {
        event.reply("save-dictionary");
      });
      saver.on("error", (error) => {
        event.reply("error-save-dictionary");
        console.error(error);
      });
      saver.start();
    });
    ipcMain.on("ready-edit-word", (event, uid, word) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        window.webContents.send("edit-word", uid, word);
      }
    });
    ipcMain.on("ready-delete-word", (event, uid) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        window.webContents.send("delete-word", uid);
      }
    });
    promiseIpcMain.on("check-duplicate-unique-name", async (uniqueName, excludedUniqueName) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        let predicate = await promiseIpcMain.send("do-check-duplicate-unique-name", window.webContents, uniqueName, excludedUniqueName);
        return predicate;
      } else {
        return true;
      }
    });
    ipcMain.on("ready-change-dictionary-settings", (event, settings) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        window.webContents.send("change-dictionary-settings", settings);
      }
    });
    ipcMain.on("git-commit", async (event, path, message) => {
      try {
        let git = simpleGit(path);
        await git.add(".");
        await git.commit(message);
        event.reply("succeed-git-commit");
      } catch (error) {
        event.reply("error-git-commit");
        console.error(error);
      }
    });
    ipcMain.on("git-push", async (event, path) => {
      try {
        let git = simpleGit(path);
        await git.push();
        event.reply("succeed-git-push");
      } catch (error) {
        event.reply("error-git-push");
        console.error(error);
      }
    });
  }

  private createWindow(mode: string, parentId: number | null, props: object, options: BrowserWindowConstructorOptions): BrowserWindow {
    let show = false;
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let additionalOptions = (!this.app.isPackaged) ? {} : PRODUCTION_WINDOW_OPTIONS;
    let window = new BrowserWindow({...COMMON_WINDOW_OPTIONS, ...additionalOptions, show, parent, ...options});
    let id = window.id;
    let idString = id.toString();
    window.loadFile(joinPath(__dirname, "index.html"), {query: {idString, mode}});
    window.setMenu(null);
    window.once("closed", () => {
      this.windows.delete(id);
    });
    this.windows.set(id, window);
    this.props.set(id, props);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 720, height: 720, minWidth: 480, minHeight: 320};
    let window = this.createWindow("main", null, {}, options);
    this.mainWindow = window;
    this.connectReloadClient(window);
    return window;
  }

  private connectReloadClient(window: BrowserWindow): void {
    if (!this.app.isPackaged) {
      client.create(window, {}, () => {
        console.log("Reload client connected");
      });
    }
  }

}


let main = new Main(electronApp);
main.main();