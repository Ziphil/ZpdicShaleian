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
  ReactNode,
  RefObject,
  createRef
} from "react";
import {
  HotKeys
} from "react-hotkeys";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";
import {
  GitStatusPane
} from ".";


@component()
export class GitCommitChooser extends Component<Props, State> {

  public state: State = {
    message: ""
  };

  private messageRef: RefObject<HTMLInputElement> = createRef();

  public async componentDidMount(): Promise<void> {
    let settings = await this.sendAsync("getSettings");
    let message = settings.defaultCommitMessage ?? "";
    this.setState({message});
    this.messageRef.current?.focus();
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
      CustomToaster.show({message: this.trans("gitCommitChooser.emptyMessage"), icon: "error", intent: "danger"});
    }
  }

  private renderMessage(): ReactNode {
    let node = (
      <FormGroup label={this.trans("gitCommitChooser.message")} labelFor="message">
        <InputGroup id="message" value={this.state.message} inputRef={this.messageRef} onChange={(event) => this.setState({message: event.target.value})}/>
      </FormGroup>
    );
    return node;
  }

  public render(): ReactNode {
    let messageNode = this.renderMessage();
    let keys = {confirm: "ctrl+enter"};
    let handlers = {confirm: this.handleConfirm.bind(this)};
    let node = (
      <div className="zpgce-editor zp-editor">
        <HotKeys keyMap={keys} handlers={handlers}>
          <div className="zpgce-message-container">
            {messageNode}
          </div>
          <div className="zpgce-status-container">
            <GitStatusPane path={this.props.path}/>
          </div>
          <div className="zpgce-editor-button zp-editor-button">
            <Button text={this.trans("common.cancel")} onClick={this.handleCancel.bind(this)}/>
            <Button text={this.trans("common.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
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
  message: string
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});