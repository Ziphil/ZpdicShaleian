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
    let percent = progress * 100;
    let offset = this.props.offset;
    let size = this.props.size;
    let node = (
      <div className="zp-loading">
        <ProgressBar value={progress} intent="primary"/>
        <div className="zp-loading-detail">
          <div className="zp-loading-percent">{this.trans("loading.percent", {percent})}</div>
          <div className="zp-loading-offset">{this.trans("loading.offset", {offset, size})}</div>
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