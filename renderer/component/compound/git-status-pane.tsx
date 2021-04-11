//

import {
  Checkbox,
  FormGroup
} from "@blueprintjs/core";
import * as react from "react";
import {
  Fragment,
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

  private renderItems(): ReactNode {
    let entries = this.state.entries ?? [];
    let itemNodes = entries.map((file, index) => {
      let match = file.names.to.match(/^(.+)(\.\w+)$/);
      let [fileBaseName, extension] = (match !== null) ? [match[1], match[2]] : [file.names.to, ""];
      let insertions = file.insertions;
      let deletions = file.deletions;
      if (insertions !== undefined && deletions !== undefined) {
        let insertionString = (insertions > 99) ? "+∞" : "+" + insertions;
        let deletionString = (deletions > 99) ? "−∞" : "−" + deletions;
        let itemNode = (
          <Checkbox key={index} checked={true}>
            <span className={`zpgsp-list-item zpgsp-${file.type}`}>
              <span className="zpgsp-type">{this.trans(`gitStatusPane.${file.type}`)}</span>
              <span className="zpgsp-diff">
                <span className="zpgsp-insertion">{insertionString}</span><span className="zpgsp-deletion">{deletionString}</span>
              </span>
              <span className="zpgsp-divider"/>
              <span className="zpgsp-base-name">{fileBaseName}</span>
              <span className="zpgsp-extension">{extension}</span>
            </span>
          </Checkbox>
        );
        return itemNode;
      } else {
        let itemNode = (
          <Checkbox key={index}  checked={true}>
            <span className="zpgsp-binary">
              <span className="zpgsp-type">{this.trans("gitStatusPane.binary")}</span>
              <span className="zpgsp-base-name">{fileBaseName}</span>
              <span className="zpgsp-extension">{extension}</span>
            </span>
          </Checkbox>
        );
        return itemNode;
      }
    });
    return itemNodes;
  }

  private renderDummyItems(): ReactNode {
    let node = (
      <Fragment>
        <Checkbox className="bp3-skeleton"/>
        <Checkbox className="bp3-skeleton"/>
      </Fragment>
    );
    return node;
  }

  public render(): ReactNode {
    let itemNode = (this.state.loading) ? this.renderDummyItems() : this.renderItems();
    let node = (
      <div className="zpgsp-status">
        <FormGroup label={this.trans("gitStatusPane.change")}>
          {itemNode}
        </FormGroup>
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