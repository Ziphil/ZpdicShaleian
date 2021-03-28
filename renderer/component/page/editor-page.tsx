//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  PlainWord
} from "../../module";
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

  private editWord(uid: string | null, word: PlainWord): void {
    window.api.send("ready-edit-word", uid, word);
    this.closeWindow();
  }

  private deleteWord(uid: string): void {
    window.api.send("ready-delete-word", uid);
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-editor-page zp-root">
        <WordEditor
          word={this.props.word}
          defaultWord={this.props.defaultWord}
          onConfirm={this.editWord.bind(this)}
          onDelete={this.deleteWord.bind(this)}
          onCancel={this.closeWindow.bind(this)}
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