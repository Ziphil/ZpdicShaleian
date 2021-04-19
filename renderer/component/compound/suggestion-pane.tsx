//

import partial from "lodash-es/partial";
import * as react from "react";
import {
  Component,
  MouseEvent,
  ReactNode
} from "react";
import {
  Dictionary,
  Suggestion
} from "../../module/dictionary";
import {
  WordPane
} from "./word-pane";


export class SuggestionPane extends Component<Props, State> {

  public render(): ReactNode {
    let suggestion = this.props.suggestion;
    let language = this.props.language;
    let onLinkCtrlClick = WordPane.requireCtrl(this.props.onLinkClick);
    let keywordNode = (suggestion.getKeywords(language).length > 0) && (
      <span className="ssp-keyword">
        ({suggestion.getKeywords(language).join(", ")})
      </span>
    );
    let nameNodes = suggestion.names.map((name) => {
      let nameNode = <span className="ssp-link ssp-sans" key={Math.random()} onClick={onLinkCtrlClick && partial(onLinkCtrlClick, name)}>{name}</span>;
      return nameNode;
    });
    let nameNode = WordPane.intersperse(nameNodes, ", ");
    let node = (
      <li className="ssp-suggestion">
        {suggestion.getKindName(language)}
        {keywordNode}
        <span className="ssp-divider">—</span>
        {nameNode}
      </li>
    );
    return node;
  }

}


type Props = {
  dictionary: Dictionary,
  suggestion: Suggestion,
  language: string,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};