//

import partial from "lodash-es/partial";
import * as react from "react";
import {
  FocusEvent,
  MouseEvent,
  ReactNode
} from "react";
import {
  Dictionary,
  Marker,
  SearchResult,
  Word
} from "soxsot";
import {
  Component
} from "../component";
import {
  Pagination,
  SuggestionPane,
  WordPaneWrapper
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class SearchResultPane extends Component<Props, State> {

  private handlePageSet(page: number): void {
    if (this.props.onPageSet) {
      this.props.onPageSet(page);
    }
  }

  public renderSuggestions(): ReactNode {
    const suggestions = this.props.searchResult.suggestions;
    const suggestionPanes = suggestions.map((suggestion, index) => {
      const suggestionPane = (
        <SuggestionPane
          key={index}
          dictionary={this.props.dictionary}
          suggestion={suggestion}
          language={this.props.language}
          useCustomFont={this.props.useCustomFont}
          onLinkClick={this.props.onLinkClick}
        />
      );
      return suggestionPane;
    });
    const node = (suggestions.length > 0) && (
      <ul className="zpwdl-suggestion">
        {suggestionPanes}
      </ul>
    );
    return node;
  }

  public renderWords(): ReactNode {
    const page = this.props.page;
    const words = this.props.searchResult.sliceWords(page);
    const wordPanes = words.map((word) => {
      const wordPane = (
        <WordPaneWrapper
          key={word.uid}
          dictionary={this.props.dictionary}
          word={word}
          language={this.props.language}
          useCustomFont={this.props.useCustomFont}
          onCreate={this.props.onCreate}
          onInherit={this.props.onInherit && partial(this.props.onInherit, word)}
          onEdit={this.props.onEdit && partial(this.props.onEdit, word)}
          onDelete={this.props.onDelete && partial(this.props.onDelete, word)}
          onActivate={this.props.onActivate && partial(this.props.onActivate, word)}
          onMarkerToggled={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, word)}
          onLinkClick={this.props.onLinkClick}
        />
      );
      return wordPane;
    });
    const node = (
      <div className="zpwdl-word">
        {wordPanes}
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    const page = this.props.page;
    const searchResult = this.props.searchResult;
    const suggestionNode = this.renderSuggestions();
    const wordNode = this.renderWords();
    const node = (
      <div className="zpwdl-list-wrapper">
        {suggestionNode}
        {wordNode}
        <div className="zpwdl-pagination-container">
          <Pagination page={page} minPage={searchResult.minPage} maxPage={searchResult.maxPage} onSet={this.handlePageSet.bind(this)}/>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
  dictionary: Dictionary,
  searchResult: SearchResult,
  language: string,
  page: number,
  useCustomFont: boolean,
  onCreate?: (event: MouseEvent<HTMLElement>) => void,
  onInherit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onEdit?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onDelete?: (word: Word, event: MouseEvent<HTMLElement>) => void,
  onMarkerToggled?: (word: Word, marker: Marker) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void,
  onActivate?: (activeWord: Word | null, event: FocusEvent<HTMLElement>) => void,
  onPageSet?: (page: number) => void
};
type State = {
};