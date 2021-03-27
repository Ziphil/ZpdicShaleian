//

import {
  InputGroup
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


export class WordSearcher extends Component<Props, State> {

  public render(): ReactNode {
    let node = (
      <div className="zp-word-searcher">
        <InputGroup/>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
};