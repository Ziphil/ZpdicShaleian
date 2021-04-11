//

import {
  Button
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class GitPushPage extends Component<Props, State> {

  private handleConfirm(): void {
    this.closeWindow(true);
  }

  private handleCancel(): void {
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpgpp-root zp-root">
        <div className="zp-editor">
          <div>
            <div style={{flexGrow: 1}}/>
            <div className="zp-editor-button">
              <Button text={this.trans("common.cancel")} onClick={this.handleCancel.bind(this)}/>
              <Button text={this.trans("common.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
            </div>
          </div>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
};