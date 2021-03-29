//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  Marker
} from "../../module";


export class MarkerIcon extends Component<Props, State> {

  public renderPath(): ReactNode {
    let marker = this.props.marker;
    if (marker === "circle") {
      return <circle cx="4.5" cy="4.5" r="4.5"/>;
    } else if (marker === "square") {
      return <path d="M 0 0 L 0 9 L 9 9 L 9 0 Z"/>;
    } else if (marker === "up") {
      return <path d="M 4.5 0 L 0 9 L 9 9 Z"/>;
    } else if (marker === "diamond") {
      return <path d="M 4.5 0 L 0 4.5 L 4.5 9 L 9 4.5 Z"/>;
    } else if (marker === "down") {
      return <path d="M 4.5 9 L 0 0 L 9 0 Z"/>;
    } else if (marker === "cross") {
      return <path d="M 3 0 L 3 3 L 0 3 L 0 6 L 3 6 L 3 9 L 6 9 L 6 6 L 9 6 L 9 3 L 6 3 L 6 0 Z"/>;
    } else if (marker === "pentagon") {
      return <path d="M 4.5 0 L 0 4 L 2 9 L 7 9 L 9 4 Z"/>;
    } else if (marker === "heart") {
      return <path d="M 0 2 C 0 5, 4.5 9, 4.5 9 C 4.5 9, 9 5, 9 2 C 9 1, 8 0, 7 0 C 6 0, 4.5 1, 4.5 2 C 4.5 1, 3 0, 2 0 C 1 0, 0 1, 0 2 Z"/>;
    } else {
      throw new Error("cannot happen");
    }
  }

  public render(): ReactNode {
    let pathNode = this.renderPath();
    if (this.props.icon) {
      let className = "bp3-icon" + ((this.props.className !== undefined) ? ` ${this.props.className}` : "");
      let node = (
        <span className={className}>
          <svg width="9" height="16" viewBox="0 -4 9 16">
            {pathNode}
          </svg>
        </span>
      );
      return node;
    } else {
      let node = (
        <svg className={this.props.className} width="9" height="9" viewBox="0 0 9 9">
          {pathNode}
        </svg>
      );
      return node;
    }
  }

}


type Props = {
  marker: Marker,
  icon?: boolean,
  className?: string
};
type State = {
};