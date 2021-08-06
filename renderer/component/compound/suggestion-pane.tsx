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
} from "soxsot";
import {
  WordPane
} from "./word-pane";


export class SuggestionPane extends Component<Props, State> {

  public render(): ReactNode {
    let suggestion = this.props.suggestion;
    let language = this.props.language;
    let descriptionNames = suggestion.getDescriptionNames(language).filter((name) => name !== undefined);
    let onLinkAltClick = WordPane.requireAlt(this.props.onLinkClick);
    let linkClassName = (this.props.useCustomFont) ? "ssp-link swp-shaleian" : "ssp-link swp-sans";
    let keywordNode = (descriptionNames.length > 0) && (
      <span className="ssp-keyword">
        ({descriptionNames.join(", ").toLowerCase()})
      </span>
    );
    let nameNodes = suggestion.names.map((name) => {
      let nameNode = <span className={linkClassName} key={Math.random()} onClick={onLinkAltClick && partial(onLinkAltClick, name)}>{name}</span>;
      return nameNode;
    });
    let nameNode = WordPane.intersperse(nameNodes, ", ");
    let node = (
      <li className="ssp-suggestion">
        {suggestion.getKindName(language)?.toLowerCase()}
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
  useCustomFont: boolean,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};