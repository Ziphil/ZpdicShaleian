//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  GitCommitExecutor
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
        <GitCommitExecutor
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