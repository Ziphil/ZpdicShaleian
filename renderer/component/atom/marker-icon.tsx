//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  Marker
} from "../../module/dictionary";


export class MarkerIcon extends Component<Props, State> {

  public renderPath(): ReactNode {
    let marker = this.props.marker;
    if (marker === "circle") {
      return <circle cx="5.5" cy="5.5" r="5.5"/>;
    } else if (marker === "square") {
      return <path d="M 0 0 L 0 11 L 11 11 L 11 0 Z"/>;
    } else if (marker === "up") {
      return <path d="M 5.5 0 L 0 11 L 11 11 Z"/>;
    } else if (marker === "diamond") {
      return <path d="M 5.5 0 L 0 5.5 L 5.5 11 L 11 5.5 Z"/>;
    } else if (marker === "down") {
      return <path d="M 5.5 11 L 0 0 L 11 0 Z"/>;
    } else if (marker === "cross") {
      return <path d="M 3 0 L 3 3 L 0 3 L 0 8 L 3 8 L 3 11 L 8 11 L 8 8 L 11 8 L 11 3 L 8 3 L 8 0 Z"/>;
    } else if (marker === "heart") {
      return <path d="M 0 3 C 0 5, 5.5 11, 5.5 11 C 5.5 11, 11 5, 11 3 C 11 1.75, 9.5 0, 8.25 0 C 7 0, 5.5 2, 5.5 3 C 5.5 2, 4 0, 2.75 0 C 1.5 0, 0 1.75, 0 3 Z"/>;
    } else if (marker === "pentagon") {
      return <path d="M 5.5 0 L 0 4 L 2 11 L 9 11 L 11 4 Z"/>;
    } else if (marker === "hexagon") {
      return <path d="M 0 5.5 L 3 0 L 8 0 L 11 5.5 L 8 11 L 3 11 Z"/>;
    } else if (marker === "trapezoid") {
      return <path d="M 3 0 L 0 11 L 11 11 L 8 0 Z"/>;
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
          <svg width="11" height="16" viewBox="0 -2 11 16">
            {pathNode}
          </svg>
        </span>
      );
      return node;
    } else {
      let node = (
        <svg className={this.props.className} width="11" height="11" viewBox="0 0 11 11">
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