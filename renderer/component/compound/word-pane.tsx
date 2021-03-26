//

import {
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  Word
} from "../../module";


export class WordPane extends Component<Props, State> {

  public render(): ReactNode {
    let node = (
      <div className="zp-word-pane">
        {this.props.word.name}
      </div>
    );
    return node;
  }

}


type Props = {
  word: Word
};
type State = {
};