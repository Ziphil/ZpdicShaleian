//

import {
  Divider
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  GitDiffEntry
} from "../../../main/handler/git";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class GitStatusPane extends Component<Props, State> {

  public state: State = {
    entries: null,
    loading: true
  };

  public async componentDidMount(): Promise<void> {
    try {
      let entries = await this.sendAsync("execGitDiff", this.props.path);
      this.setState({entries, loading: false});
    } catch (error) {
      this.setState({entries: null, loading: true});
    }
  }

  private renderItemList(): ReactNode {
    let entries = this.state.entries ?? [];
    let itemNodes = entries.map((file, index) => {
      let match = file.names.to.match(/^(.+)(\.\w+)$/);
      let [fileBaseName, extension] = (match !== null) ? [match[1], match[2]] : [file.names.to, ""];
      if (file.insertions !== undefined && file.deletions !== undefined) {
        let itemNode = (
          <li className={`zpgsp-list-item zpgsp-${file.type}`} key={index}>
            <span className="zpgsp-type">{this.trans(`gitStatusPane.${file.type}`)}</span>
            <span className="zpgsp-diff">
              <span className="zpgsp-insertion">+{file.insertions}</span><span className="zpgsp-deletion">−{file.deletions}</span>
            </span>
            <Divider/>
            <span className="zpgsp-base-name">{fileBaseName}</span>
            <span className="zpgsp-extension">{extension}</span>
          </li>
        );
        return itemNode;
      } else {
        let itemNode = (
          <li className="zpgsp-binary" key={index}>
            <span className="zpgsp-type">{this.trans("gitStatusPane.binary")}</span>
            <span className="zpgsp-base-name">{fileBaseName}</span>
            <span className="zpgsp-extension">{extension}</span>
          </li>
        );
        return itemNode;
      }
    });
    let node = (
      <ul className="zpgsp-list">
        {itemNodes}
      </ul>
    );
    return node;
  }

  private renderDummyItemList(): ReactNode {
    let node = (
      <ul className="zpgsp-list bp3-skeleton">
        <li className="zpgsp-list-item">dummy</li>
        <li className="zpgsp-list-item">dummy</li>
        <li className="zpgsp-list-item">dummy</li>
      </ul>
    );
    return node;
  }

  public render(): ReactNode {
    let listNode = (this.state.loading) ? this.renderDummyItemList() : this.renderItemList();
    let node = (
      <div className="zpgsp-status">
        <div className="zpgsp-label">{this.trans("gitStatusPane.change")}</div>
        {listNode}
      </div>
    );
    return node;
  }

}


type Props = {
  path: string
};
type State = {
  entries: Array<GitDiffEntry> | null,
  loading: boolean
};