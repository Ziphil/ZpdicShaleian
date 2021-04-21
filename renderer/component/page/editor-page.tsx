//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  PlainWord
} from "soxsot";
import {
  Component
} from "../component";
import {
  WordEditor
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class EditorPage extends Component<Props, State> {

  private handleConfirm(uid: string | null, newWord: PlainWord): void {
    this.closeWindow({uid, newWord});
  }

  private handleCancel(): void {
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpedp-root zp-root">
        <WordEditor
          word={this.props.word}
          defaultWord={this.props.defaultWord}
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        />
      </div>
    );
    return node;
  }

}


type Props = {
  word: PlainWord | null,
  defaultWord?: PlainWord
};
type State = {
};