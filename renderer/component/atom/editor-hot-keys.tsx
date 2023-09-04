//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  GlobalHotKeys
} from "react-hotkeys";


export class EditorHotKeys extends Component<Props, State> {

  public render(): ReactNode {
    const keys = {confirm: ["alt+enter"], cancel: ["escape"]};
    const handlers = {confirm: this.props.onConfirm, cancel: this.props.onCancel} as any;
    const node = (
      <GlobalHotKeys keyMap={keys} handlers={handlers}>
        <div>
          {this.props.children}
        </div>
      </GlobalHotKeys>
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