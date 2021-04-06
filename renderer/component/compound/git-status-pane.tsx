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
    status: null
  };

  public async componentDidMount(): Promise<void> {
    try {
      let status = await window.api.sendAsync("exec-git-status", this.props.path);
      this.setState({status});
    } catch (error) {
      this.setState({status: null});
    }
  }

  private renderItemList(type: "added" | "modified" | "renamed" | "deleted"): ReactNode {
    let status = this.state.status;
    if (status !== null) {
      let data = (type === "added") ? status["not_added"] : (type === "renamed") ? status[type].map((spec) => spec.to) : status[type];
      let itemNodes = data.map((fileName, index) => {
        let match = fileName.match(/^(.+)(\.\w+)$/);
        let [fileBaseName, extension] = (match !== null) ? [match[1], match[2]] : [fileName, ""];
        let itemNode = (
          <li className={`zpgsp-${type}`} key={`${type}-${index}`}>
            <span className="zpgsp-type">{this.trans(`gitCommitExecutor.${type}`)}</span>
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

  public render(): ReactNode {
    let createdNodes = this.renderItemList("added");
    let modifiedNodes = this.renderItemList("modified");
    let renamedNodes = this.renderItemList("renamed");
    let deletedNodes = this.renderItemList("deleted");
    let node = (
      <div className="zpgsp-status">
        <div className="zpgsp-label">{this.trans("gitCommitExecutor.change")}</div>
        <ul className="zpgsp-list">
          {createdNodes}
          {modifiedNodes}
          {renamedNodes}
          {deletedNodes}
        </ul>
      </div>
    );
    return node;
  }

}


type Props = {
  path: string
};
type State = {
  status: StatusResult | null
};