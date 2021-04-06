//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  StatusResult
} from "simple-git";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class GitStatusPane extends Component<Props, State> {

  public state: State = {
    status: null,
    loading: true
  };

  public async componentDidMount(): Promise<void> {
    try {
      let status = await window.api.sendAsync("exec-git-status", this.props.path);
      this.setState({status, loading: false});
    } catch (error) {
      this.setState({status: null, loading: true});
    }
  }

  private renderItem(type: "added" | "modified" | "renamed" | "deleted"): ReactNode {
    let status = this.state.status;
    if (status !== null) {
      let data = (type === "added") ? status["not_added"] : (type === "renamed") ? status[type].map((spec) => spec.to) : status[type];
      let itemNodes = data.map((fileName, index) => {
        let match = fileName.match(/^(.+)(\.\w+)$/);
        let [fileBaseName, extension] = (match !== null) ? [match[1], match[2]] : [fileName, ""];
        let itemNode = (
          <li className={`zpgsp-${type}`} key={`${type}-${index}`}>
            <span className="zpgsp-type">{this.trans(`gitStatusPane.${type}`)}</span>
            <span className="zpgsp-base-name">{fileBaseName}</span>
            <span className="zpgsp-extension">{extension}</span>
          </li>
        );
        return itemNode;
      });
      return itemNodes;
    } else {
      return null;
    }
  };

  private renderItemList(): ReactNode {
    let createdNodes = this.renderItem("added");
    let modifiedNodes = this.renderItem("modified");
    let renamedNodes = this.renderItem("renamed");
    let deletedNodes = this.renderItem("deleted");
    let node = (
      <ul className="zpgsp-list">
        {createdNodes}
        {modifiedNodes}
        {renamedNodes}
        {deletedNodes}
      </ul>
    );
    return node;
  }

  private renderDummyItemList(): ReactNode {
    let node = (
      <ul className="zpgsp-list">
        <li className="bp3-skeleton">dummy</li>
        <li className="bp3-skeleton">dummy</li>
        <li className="bp3-skeleton">dummy</li>
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
  status: StatusResult | null,
  loading: boolean
};