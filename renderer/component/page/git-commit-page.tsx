//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  GitCommitChooser
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class GitCommitPage extends Component<Props, State> {

  private handleConfirm(message: string): void {
    this.closeWindow(message);
  }

  private handleCancel(): void {
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpgcp-root zp-root">
        <GitCommitChooser
          path={this.props.path}
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        />
      </div>
    );
    return node;
  }

}


type Props = {
  path: string
};
type State = {
};