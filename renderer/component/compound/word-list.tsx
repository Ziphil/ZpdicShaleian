//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  WordPane
} from "../compound/word-pane";
import {
  Word
} from "../../module";


export class WordList extends Component<Props, State> {

  public render(): ReactNode {
    let wordPanes = this.props.words.slice(0, 20).map((word) => {
      let wordPane = (
        <WordPane key={word.name} word={word} language={this.props.language}/>
      );
      return wordPane;
    }); 
    let node = (
      <div className="zp-word-list">
        {wordPanes}
      </div>
    );
    return node;
  }

}


type Props = {
  words: Array<Word>,
  language: string
};
type State = {
};