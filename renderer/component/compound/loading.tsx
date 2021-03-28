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
import {
  component
} from "../decorator";


@component()
export class Loading extends Component<Props, State> {

  private renderProgressBar(): ReactNode {
    let progress = (this.props.size > 0) ? this.props.offset / this.props.size : 0;
    let node = (
      <div className="zp-loading">
        <ProgressBar value={progress} intent="primary"/>
        <div className="zp-loading-detail">
          <div className="zp-loading-percent">{(progress * 100).toFixed(2)} %</div>
          <div className="zp-loading-offset">{this.props.offset} / {this.props.size}</div>
        </div>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let node = (this.props.loading) ? this.renderProgressBar() : <Fragment>{this.props.children}</Fragment>;
    return node;
  }

}


type Props = {
  loading: boolean,
  offset: number,
  size: number
};
type State = {
};