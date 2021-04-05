//

import {
  Button,
  FormGroup,
  InputGroup,
  Toaster
} from "@blueprintjs/core";
import * as react from "react";
import {
  MouseEvent,
  ReactNode
} from "react";
import {
  HotKeys
} from "react-hotkeys";
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
export class GitCommitExecutor extends Component<Props, State> {

  public state: State = {
    message: "",
    status: null
  };

  public async componentDidMount(): Promise<void> {
    await Promise.all([this.loadMessage(), this.loadStatus()]);
  }

  private async loadMessage(): Promise<void> {
    let settings = await window.api.sendAsync("get-settings");
    let message = settings.defaultCommitMessage ?? "";
    this.setState({message});
  }

  private async loadStatus(): Promise<void> {
    try {
      let status = await window.api.sendAsync("git-status", this.props.path);
      this.setState({status});
    } catch (error) {
      this.setState({status: null});
    }
  }

  private handleCancel(event: MouseEvent<HTMLElement>): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private async handleConfirm(event?: MouseEvent<HTMLElement> | KeyboardEvent): Promise<void> {
    let message = this.state.message.trim();
    if (message !== "") {
      if (this.props.onConfirm) {
        this.props.onConfirm(message, event);
      }
    } else {
      CustomToaster.show({message: this.trans("dictionarySettingsEditor.emptyMessage"), icon: "error", intent: "danger"});
    }
  }

  private renderMessage(): ReactNode {
    let node = (
      <FormGroup label={this.trans("gitCommitExecutor.message")} labelFor="message">
        <InputGroup id="message" value={this.state.message} onChange={(event) => this.setState({message: event.target.value})}/>
      </FormGroup>
    );
    return node;
  }

  private renderStatus(): ReactNode {
    let status = this.state.status;
    let createItemNodes = function (type: "added" | "modified" | "renamed" | "deleted"): ReactNode {
      if (status !== null) {
        let data = (type === "added") ? status["not_added"] : (type === "renamed") ? status[type].map((spec) => spec.to) : status[type];
        let itemNodes = data.map((fileName, index) => {
          let match = fileName.match(/^(.+)(\.\w+)$/);
          let [fileBaseName, extension] = (match !== null) ? [match[1], match[2]] : [fileName, ""];
          let itemNode = (
            <li className={"zp-" + type} key={type + index}>
              {fileBaseName}
              <span className="zp-extension">{extension}</span>
            </li>
          );
          return itemNode;
        });
        return itemNodes;
      } else {
        return null;
      }
    };
    let createdNodes = createItemNodes("added");
    let modifiedNodes = createItemNodes("modified");
    let renamedNodes = createItemNodes("renamed");
    let deletedNodes = createItemNodes("deleted");
    let node = (
      <div className="zp-git-commit-executor-status">
        <div className="zp-git-commit-executor-status-label">{this.trans("gitCommitExecutor.change")}</div>
        <ul className="zp-git-commit-executor-status-list">
          {createdNodes}
          {modifiedNodes}
          {renamedNodes}
          {deletedNodes}
        </ul>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let messageNode = this.renderMessage();
    let statusNode = this.renderStatus();
    let keys = {confirm: "ctrl+enter"};
    let handlers = {confirm: this.handleConfirm.bind(this)};
    let node = (
      <div className="zp-git-commit-executor zp-editor">
        <HotKeys keyMap={keys} handlers={handlers}>
          <div className="zp-git-commit-executor-message-container">
            {messageNode}
          </div>
          <div className="zp-git-commit-executor-status-container">
            {statusNode}
          </div>
          <div className="zp-git-commit-executor-button zp-editor-button">
            <Button text={this.trans("gitCommitExecutor.cancel")} onClick={this.handleCancel.bind(this)}/>
            <Button text={this.trans("gitCommitExecutor.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
          </div>
        </HotKeys>
      </div>
    );
    return node;
  }

}


type Props = {
  path: string,
  onConfirm?: (message: string, event?: MouseEvent<HTMLElement> | KeyboardEvent) => void,
  onCancel?: (event: MouseEvent<HTMLElement>) => void
};
type State = {
  message: string,
  status: StatusResult | null
};

let CustomToaster = Toaster.create({className: "zp-dictionary-settings-toaster", position: "top", maxToasts: 2});