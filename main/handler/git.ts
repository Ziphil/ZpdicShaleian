//

import {
  IpcMainEvent
} from "electron";
import simpleGit from "simple-git";
import {
  StatusResult
} from "simple-git";
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
export class GitHandler extends Handler {

  @onAsync("exec-git-status")
  private async execGitStatus(this: Main, event: IpcMainEvent, path: string): Promise<StatusResult> {
    try {
      let git = simpleGit(path);
      let status = await git.status();
      return status;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @on("exec-git-commit")
  private async execGitCommit(this: Main, event: IpcMainEvent, path: string, message?: string): Promise<void> {
    let window = this.mainWindow;
    try {
      let git = simpleGit(path);
      let nextMessage = message || this.settings.defaultCommitMessage;
      if (nextMessage !== undefined && nextMessage !== "") {
        await git.add(".");
        await git.commit(nextMessage, ["--allow-empty"]);
        if (window !== undefined) {
          this.ipcMain.send("succeed-exec-git-commit", window.webContents);
        }
      } else {
        if (window !== undefined) {
          this.ipcMain.send("error-exec-git-commit", window.webContents);
        }
      }
    } catch (error) {
      console.error(error);
      if (window !== undefined) {
        this.ipcMain.send("error-exec-git-commit", window.webContents);
      }
    }
  }

  @onAsync("exec-git-push")
  private async execGitPush(this: Main, event: IpcMainEvent, path: string): Promise<void> {
    try {
      let git = simpleGit(path);
      await git.push();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}