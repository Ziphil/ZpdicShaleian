//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  HotKeys
} from "react-hotkeys";


export class EditorHotKeys extends Component<Props, State> {

  public render(): ReactNode {
    let keys = {confirm: ["ctrl+enter"], cancel: ["escape"]};
    let handlers = {confirm: this.props.onConfirm, cancel: this.props.onCancel} as any;
    let node = (
      <HotKeys keyMap={keys} handlers={handlers}>
        {this.props.children}
      </HotKeys>
    );
    return node;
  }

}


type Props = {
  onConfirm?: (event: KeyboardEvent) => void,
  onCancel?: (event: KeyboardEvent) => void
};
type State = {
};