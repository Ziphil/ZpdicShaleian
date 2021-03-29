//

import * as react from "react";
import {
  Fragment,
  ReactNode
} from "react";
import {
  EnhancedProgressBar
} from "../atom";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class Loading extends Component<Props, State> {

  public render(): ReactNode {
    if (this.props.loading) {
      let node = <EnhancedProgressBar offset={this.props.offset} size={this.props.size} showDetail={true}/>;
      return node;
    } else {
      let node = <Fragment>{this.props.children}</Fragment>;
      return node;
    }
  }

}


type Props = {
  loading: boolean,
  offset: number,
  size: number
};
type State = {
};