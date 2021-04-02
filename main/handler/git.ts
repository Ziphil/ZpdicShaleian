//

import {
  IpcMainEvent
} from "electron";
import simpleGit from "simple-git";
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

  @onAsync("git-commit")
  private async gitCommit(this: Main, event: IpcMainEvent, path: string, message?: string): Promise<void> {
    try {
      let git = simpleGit(path);
      let nextMessage = message ?? this.settings.defaultCommitMessage;
      if (nextMessage !== undefined) {
        await git.add(".");
        await git.commit(nextMessage);
      } else {
        throw new Error("message not specified");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("git-push")
  private async gitPush(this: Main, event: IpcMainEvent, path: string): Promise<void> {
    try {
      let git = simpleGit(path);
      await git.push();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}