//

import {
  IpcMainEvent
} from "electron";
import simpleGit from "simple-git";
import {
  handler,
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
      const git = simpleGit(path);
      await git.raw("add", "--all");
      const statusResult = await git.status();
      const diffResult = await git.diffSummary(["--staged"]);
      await git.reset();
      const files = diffResult.files;
      const findType = function (names: {from: string | null, to: string}): string {
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
      const parseNameDescription = function (nameDescription: string): {from: string | null, to: string} {
        let match;
        if (match = nameDescription.match(/^(.*)\{(.+?)\s*=>\s*(.+?)\}$/)) {
          const from = match[1] + "/" + match[2];
          const to = match[1] + "/" + match[3];
          return {from, to};
        } else if (match = nameDescription.match(/^(.+?)\s*=>\s*(.+?)$/)) {
          const from = match[1];
          const to = match[2];
          return {from, to};
        } else {
          const from = null;
          const to = nameDescription;
          return {from, to};
        }
      };
      const entries = files.map((file) => {
        const names = parseNameDescription(file.file);
        if ("insertions" in file) {
          const {changes, insertions, deletions} = file;
          const type = findType(names);
          return {type, names, changes, insertions, deletions};
        } else {
          const type = "binary";
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
      const git = simpleGit(path);
      await git.reset();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitAddIntent")
  private async execGitAddIntent(event: IpcMainEvent, path: string): Promise<void> {
    try {
      const git = simpleGit(path);
      const statusResult = await git.status();
      await git.raw("add", "--intent-to-add", ...statusResult["not_added"]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @onAsync("execGitCommit")
  private async execGitCommit(event: IpcMainEvent, path: string, message: string | null): Promise<void> {
    try {
      const git = simpleGit(path);
      const nextMessage = message || this.main.settings.defaultCommitMessage;
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
      const git = simpleGit(path);
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