//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  PlainWord
} from "../../module/dictionary";
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

  private editWord(uid: string | null, newWord: PlainWord): void {
    this.respond({uid, newWord});
    this.closeWindow();
  }

  private deleteWord(uid: string): void {
    this.respond({uid, newWord: null});
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpedp-root zp-root">
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