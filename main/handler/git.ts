//

import {
  IpcMainEvent
} from "electron";
import simpleGit from "simple-git";
import {
  StatusResult
} from "simple-git";
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
  private async execGitStatus(event: IpcMainEvent, path: string): Promise<StatusResult> {
    try {
      let git = simpleGit(path);
      let status = await git.status();
      return status;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("exec-git-commit")
  private async execGitCommit(event: IpcMainEvent, path: string, message?: string): Promise<void> {
    try {
      let git = simpleGit(path);
      let nextMessage = message || this.main.settings.defaultCommitMessage;
      if (nextMessage !== undefined && nextMessage !== "") {
        await git.add(".");
        await git.commit(nextMessage, ["--allow-empty"]);
      } else {
        throw new Error("empty message");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("exec-git-push")
  private async execGitPush(event: IpcMainEvent, path: string): Promise<void> {
    try {
      let git = simpleGit(path);
      await git.push();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}