//

import {
  ProgressBar
} from "@blueprintjs/core";
import * as react from "react";
import {
  Fragment,
  ReactNode
} from "react";
import {
  Component
} from "../component";


export class Loading extends Component<Props, State> {

  public render(): ReactNode {
    if (this.props.loading) {
      let node = (
        <div className="zp-loading">
          <ProgressBar value={this.props.progress} intent="primary"/>
        </div>
      );
      return node;
    } else {
      let node = (
        <Fragment>
          {this.props.children}
        </Fragment>
      );
      return node;
    }
  }

}


type Props = {
  loading: boolean,
  progress: number
};
type State = {
};