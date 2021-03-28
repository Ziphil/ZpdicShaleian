//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Word
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

  public state: State = {
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-editor-page zp-root">
        <WordEditor word={this.props.word}/>
      </div>
    );
    return node;
  }

}


type Props = {
  word: Word | null
};
type State = {
};