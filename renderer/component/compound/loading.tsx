//

import * as react from "react";
import {
  Fragment,
  ReactNode
} from "react";
import {
  EnhancedProgressBar,
  Progress
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
      const node = <EnhancedProgressBar progress={this.props.progress} showDetail={true}/>;
      return node;
    } else {
      const node = <Fragment>{this.props.children}</Fragment>;
      return node;
    }
  }

}


type Props = {
  loading: boolean,
  progress: Progress
};
type State = {
};