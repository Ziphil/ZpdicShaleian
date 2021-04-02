//

import {
  App,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
  app as electronApp
} from "electron";
import {
  client
} from "electron-connect";
import {
  join as joinPath
} from "path";
import simpleGit from "simple-git";
import {
  Dictionary,
  PlainDictionary
} from "../renderer/module";
import {
  DirectoryLoader
} from "../renderer/module/loader";
import {
  DirectorySaver
} from "../renderer/module/saver";
import {
  BrowserWindowUtil
} from "./util/browser-window";
import {
  ipcMain
} from "./util/ipc/ipc-main";


const COMMON_WINDOW_OPTIONS = {
  resizable: true,
  fullscreenable: false,
  autoHideMenuBar: true,
  acceptFirstMouse: true,
  useContentSize: true,
  title: "ZpDIC for Shaleian",
  backgroundColor: "#F5F8FA",
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
    ipcMain.onAsync("get-props", async (event, id) => {
      let props = this.props.get(id);
      if (props !== undefined) {
        let props = this.props.get(id);
        this.props.delete(id);
        return props;
      } else {
        return {};
      }
    });
    ipcMain.on("show", (event, id) => {
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
    ipcMain.on("close-window", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.close();
      }
    });
    ipcMain.on("destroy-window", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.destroy();
      }
    });
    ipcMain.on("create-window", (event, mode, parentId, props, options) => {
      this.createWindow(mode, parentId, props, options);
    });
    ipcMain.on("open-dev-tools", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.webContents.openDevTools();
      }
    });
    ipcMain.onAsync("show-open-dialog", async (event, id, options) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        return await dialog.showOpenDialog(window, options);
      } else {
        return await dialog.showOpenDialog(options);
      }
    });
  }

  private setupIpc(): void {
    ipcMain.onAsync("load-dictionary", (event, path) => {
      let loader = new DirectoryLoader(path);
      let promise = new Promise<PlainDictionary>((resolve, reject) => {
        loader.on("progress", (offset, size) => {
          event.reply("get-load-dictionary-progress", {offset, size});
        });
        loader.on("end", (dictionary) => {
          resolve(dictionary.toPlain());
        });
        loader.on("error", (error) => {
          console.error(error);
          reject(error);
        });
        loader.start();
      });
      return promise;
    });
    ipcMain.onAsync("save-dictionary", (event, plainDictionary, path) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let saver = new DirectorySaver(dictionary, path);
      let promise = new Promise<void>((resolve, reject) => {
        saver.on("progress", (offset, size) => {
          event.reply("get-save-dictionary-progress", {offset, size});
        });
        saver.on("end", () => {
          resolve();
        });
        saver.on("error", (error) => {
          console.error(error);
          reject(error);
        });
        saver.start();
      });
      return promise;
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
    ipcMain.onAsync("validate-edit-word", async (event, uid, word) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        let errorType = await ipcMain.sendAsync("do-validate-edit-word", window.webContents, uid, word);
        return errorType;
      } else {
        return "";
      }
    });
    ipcMain.on("ready-change-dictionary-settings", (event, settings) => {
      let window = this.mainWindow;
      if (window !== undefined) {
        window.webContents.send("change-dictionary-settings", settings);
      }
    });
    ipcMain.onAsync("git-commit", async (event, path, message) => {
      try {
        let git = simpleGit(path);
        await git.add(".");
        await git.commit(message);
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
    ipcMain.onAsync("git-push", async (event, path) => {
      try {
        let git = simpleGit(path);
        await git.push();
      } catch (error) {
        console.error(error);
        throw error;
      }
    });
  }

  private createWindow(mode: string, parentId: number | null, props: object, options: BrowserWindowConstructorOptions): BrowserWindow {
    let show = false;
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let additionalOptions = (!this.app.isPackaged) ? {} : PRODUCTION_WINDOW_OPTIONS;
    let window = new BrowserWindow({...COMMON_WINDOW_OPTIONS, ...additionalOptions, show, parent, ...options});
    if (parent !== undefined) {
      BrowserWindowUtil.centerToParent(parent, window);
    }
    let id = window.id;
    let idString = id.toString();
    window.loadFile(joinPath(__dirname, "index.html"), {query: {idString, mode}});
    window.setMenu(null);
    window.show();
    window.once("closed", () => {
      this.windows.delete(id);
    });
    this.windows.set(id, window);
    this.props.set(id, props);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 720, height: 720, minWidth: 640, minHeight: 480};
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