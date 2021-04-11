//

import {
  IpcMainEvent
} from "electron";
import simpleGit from "simple-git";
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

  @onAsync("execGitDiff")
  private async execGitDiff(event: IpcMainEvent, path: string): Promise<Array<GitDiffEntry>> {
    try {
      let git = simpleGit(path);
      await git.raw("add", "--all");
      let statusResult = await git.status();
      let diffResult = await git.diffSummary(["--staged"]);
      await git.reset();
      let files = diffResult.files;
      let findType = function (names: {from: string | null, to: string}) {
        if (statusResult.created.includes(names.to)) {
          return "created";
        } else if (statusResult.modified.includes(names.to)) {
          return "modified";
        } else if (statusResult.deleted.includes(names.to)) {
          return "deleted";
        } else if (statusResult.renamed.findIndex((renamedNames) => renamedNames.to === names.to) >= 0) {
          return "renamed";
        } else {
          return "unknown";
        }
      };
      let parseNameDescription = function (nameDescription: string): {from: string | null, to: string} {
        let match;
        if (match = nameDescription.match(/^(.*)\{(.+?)\s*=>\s*(.+?)\}$/)) {
          let from = match[1] + "/" + match[2];
          let to = match[1] + "/" + match[3];
          return {from, to};
        } else if (match = nameDescription.match(/^(.+?)\s*=>\s*(.+?)$/)) {
          let from = match[1];
          let to = match[2];
          return {from, to};
        } else {
          let from = null;
          let to = nameDescription;
          return {from, to};
        }
      };
      let entries = files.map((file) => {
        let names = parseNameDescription(file.file);
        if ("insertions" in file) {
          let {changes, insertions, deletions} = file;
          let type = findType(names);
          return {type, names, changes, insertions, deletions};
        } else {
          let type = "binary";
          return {type, names};
        }
      });
      return entries;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitReset")
  private async execGitReset(event: IpcMainEvent, path: string): Promise<void> {
    try {
      let git = simpleGit(path);
      await git.reset();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitAddIntent")
  private async execGitAddIntent(event: IpcMainEvent, path: string): Promise<void> {
    try {
      let git = simpleGit(path);
      let statusResult = await git.status();
      await git.raw("add", "--intent-to-add", ...statusResult["not_added"]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitCommit")
  private async execGitCommit(event: IpcMainEvent, path: string, message: string | null): Promise<void> {
    try {
      let git = simpleGit(path);
      let nextMessage = message || this.main.settings.defaultCommitMessage;
      if (nextMessage !== undefined && nextMessage !== "") {
        await git.raw("add", "--all");
        await git.commit(nextMessage, ["--allow-empty"]);
      } else {
        throw new Error("empty message");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitPush")
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


export type GitDiffEntry = {
  type: string,
  names: {from: string | null, to: string},
  changes?: number,
  insertions?: number,
  deletions?: number
};