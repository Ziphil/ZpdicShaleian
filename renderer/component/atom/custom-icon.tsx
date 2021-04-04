//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";


export class CustomIcon extends Component<Props, State> {

  public render(): ReactNode {
    let commands = ICON_PATH_COMMANDS[this.props.name] ?? "";
    let node = (
      <span className="bp3-icon">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d={commands}/>
        </svg>
      </span>
    );
    return node;
  }

}


type Props = {
  name: string
};
type State = {
};

const ICON_PATH_COMMANDS = require("../../resource/icon.yml");