//

import partial from "lodash-es/partial";
import * as react from "react";
import {
  MouseEvent,
  ReactNode
} from "react";
import InfiniteScroll from "react-infinite-scroller"
import {
  Component
} from "../component";
import {
  WordPaneWrapper
} from "../compound";
import {
  component
} from "../decorator";
import {
  Word
} from "../../module";


@component()
export class WordList extends Component<Props, State> {

  public state: State = {
    displayedWords: []
  }

  public constructor(props: Props) {
    super(props);
    let displayedWords = props.words.slice(0, 10);
    this.state = {displayedWords};
  }

  public componentDidUpdate(previousProps: any): void {
    if (this.props !== previousProps) {
      let displayedWords = this.props.words.slice(0, 10);
      this.setState({displayedWords});
      document.getElementById("word-list-container")!.scrollTop = 0;
    }
  }
  
  public loadWords(page: number): void {
    let length = this.state.displayedWords.length;
    let displayedWords = this.props.words.slice(0, length + 10);
    this.setState({displayedWords});
  }

  public render(): ReactNode {
    let hasMore = this.props.words.length > this.state.displayedWords.length;
    let wordPanes = this.state.displayedWords.map((word) => {
      let wordPane = (
        <WordPaneWrapper
          word={word}
          language={this.props.language}
          onCreate={this.props.onCreate}
          onInherit={this.props.onInherit && partial(this.props.onInherit, word)}
          onEdit={this.props.onEdit && partial(this.props.onEdit, word)}
          onDelete={this.props.onDelete && partial(this.props.onDelete, word)}
          onLinkClick={this.props.onLinkClick}
        />
      );
      return wordPane;
    });
    let node = (
      <div className="zp-word-list" id="word-list">
        <InfiniteScroll loadMore={this.loadWords.bind(this)} hasMore={hasMore} initialLoad={false} useWindow={false} getScrollParent={() => document.getElementById("word-list-container")!}>
          {wordPanes}
        </InfiniteScroll>
      </div>
    );
    return node;
  }

}


type Props = {
  words: Array<Word>,
  language: string,
  onCreate?: (event: MouseEvent<HTMLElement>) => void,
  onInherit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onEdit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onDelete?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
  displayedWords: Array<Word>
};