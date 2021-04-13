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
  EditorHotKeys
} from "../atom";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class UploadDictionaryChooser extends Component<Props, State> {

  public state: State = {
    url: "",
    password: ""
  };

  private urlRef: RefObject<HTMLInputElement> = createRef();
  private passwordRef: RefObject<HTMLInputElement> = createRef();

  public async componentDidMount(): Promise<void> {
    let settings = await this.sendAsync("getSettings");
    let url = settings.uploadDictionaryUrl ?? "";
    let password = settings.uploadDictionaryPassword ?? "";
    this.setState({url, password});
    this.urlRef.current?.focus();
  }

  private handleCancel(event: MouseEvent<HTMLElement> | KeyboardEvent): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private async handleConfirm(event?: MouseEvent<HTMLElement> | KeyboardEvent): Promise<void> {
    let url = this.state.url.trim();
    let password = this.state.password.trim();
    if (url !== "" && password !== "") {
      if (this.props.onConfirm) {
        this.props.onConfirm(url, password, event);
      }
    } else {
      if (url === "") {
        CustomToaster.show({message: this.trans("uploadDictionaryChooser.emptyUrl"), icon: "error", intent: "danger"});
      } else if (password === "") {
        CustomToaster.show({message: this.trans("uploadDictionaryChooser.emptyPassword"), icon: "error", intent: "danger"});
      }
    }
  }

  public render(): ReactNode {
    let node = (
      <div className="zpudc-editor zp-editor">
        <EditorHotKeys onConfirm={this.handleConfirm.bind(this)} onCancel={this.handleCancel.bind(this)}>
          <div className="zpudc-form-container">
            <FormGroup label={this.trans("uploadDictionaryChooser.url")} labelFor="url">
              <InputGroup id="url" value={this.state.url} inputRef={this.urlRef} onChange={(event) => this.setState({url: event.target.value})}/>
            </FormGroup>
            <FormGroup label={this.trans("uploadDictionaryChooser.password")} labelFor="password">
              <InputGroup id="password" type="password" value={this.state.password} inputRef={this.passwordRef} onChange={(event) => this.setState({password: event.target.value})}/>
            </FormGroup>
          </div>
          <div className="zpudc-editor-button zp-editor-button">
            <Button text={this.trans("common.cancel")} onClick={this.handleCancel.bind(this)}/>
            <Button text={this.trans("common.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
          </div>
        </EditorHotKeys>
      </div>
    );
    return node;
  }

}


type Props = {
  onConfirm?: (url: string, password: string, event?: MouseEvent<HTMLElement> | KeyboardEvent) => void,
  onCancel?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void
};
type State = {
  url: string,
  password: string
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});