//

import partial from "lodash-es/partial";
import * as react from "react";
import {
  Component,
  Fragment,
  MouseEvent,
  ReactNode
} from "react";
import {
  Dictionary,
  Equivalent,
  Information,
  InformationKindUtil,
  Marker,
  MarkupResolvers,
  ParsedWord,
  Relation,
  Section,
  Word
} from "../../module";
import {
  MarkerIcon
} from "../atom/marker-icon";


export class WordPane extends Component<Props, State> {

  private createMarkupResolvers(): MarkupResolvers<ReactNode, ReactNode> {
    let outerThis = this;
    let onLinkClick = function (name: string, event: MouseEvent<HTMLSpanElement>): void {
      if (outerThis.props.onLinkClick && event.ctrlKey) {
        outerThis.props.onLinkClick(name, event);
      }
    };
    let resolveLink = function (name: string, children: Array<ReactNode | string>): ReactNode {
      let node = <span className="swp-link" onClick={partial(onLinkClick, name)}>{children}</span>;
      return node;
    };
    let resolveBracket = function (children: Array<ReactNode | string>): ReactNode {
      let node = <span className="swp-sans">{children}</span>;
      return node;
    };
    let resolveSlash = function (string: string): ReactNode {
      let node = <span className="swp-italic">{string}</span>;
      return node;
    };
    let join = function (nodes: Array<ReactNode | string>): ReactNode {
      return nodes;
    };
    let resolvers = new MarkupResolvers(resolveLink, resolveBracket, resolveSlash, join);
    return resolvers;
  }

  private renderMarker(marker: Marker): ReactNode {
    let node = (
      <div key={marker} className={`swp-head-marker swp-marker swp-marker-${marker}`}>
        <MarkerIcon marker={marker}/>
      </div>
    );
    return node;
  }

  private renderHead(word: ParsedWord<ReactNode>, markers: Array<Marker>): ReactNode {
    let lexicalCategory = word.parts[this.props.language]?.lexicalCategory ?? null;
    let markerNodes = markers.map((marker) => this.renderMarker(marker));
    let categoryNode = (lexicalCategory !== null) && (
      <span className="swp-head-category swp-tag swp-right-margin">{lexicalCategory}</span>
    );
    let nameNode = (
      <span className="swp-head-name swp-right-margin">
        <span className="swp-sans">{word.name}</span>
      </span>
    );
    let dateNode = (
      <span className="swp-head-date">{word.date}</span>
    );
    let markerNode = (
      <div className="swp-head-markers swp-markers">
        {markerNodes}
      </div>
    );
    let node = (
      <div className="swp-head">
        <div className="swp-head-left">
          {categoryNode}
          {nameNode}
          {dateNode}
        </div>
        <div className="swp-head-right">
          {markerNode}
        </div>
      </div>
    );
    return node;
  }

  private renderSection(section: Section<ReactNode>, index: number): ReactNode {
    let equivalentNodes = section.equivalents.filter((equivalent) => !equivalent.hidden).map((equivalent, index) => this.renderEquivalent(equivalent, index));
    let informationNodes = section.informations.map((information, index) => this.renderInformation(information, index));
    let relationNodes = section.relations.map((relation, index) => this.renderRelation(relation, index));
    let equivalentNode = (section.equivalents.length > 0) && (
      <ul className="swp-equivalents swp-section-item swp-list">
        {equivalentNodes}
      </ul>
    );
    let informationNode = (section.informations.length > 0) && (
      <Fragment>
        {informationNodes}
      </Fragment>
    );
    let relationNode = (section.relations.length > 0) && (
      <ul className="swp-relations swp-section-item swp-list">
        {relationNodes}
      </ul>
    );
    let node = (
      <div className="swp-section" key={`section-${index}`}>
        {equivalentNode}
        {informationNode}
        {relationNode}
      </div>
    );
    return node;
  }

  private renderEquivalent(equivalent: Equivalent<ReactNode>, index: number): ReactNode {
    let categoryNode = (equivalent.category !== null) && (
      <span className="swp-equivalent-category swp-tag swp-right-margin">{equivalent.category}</span>
    );
    let frameNode = (equivalent.frame !== null) && (
      <span className="swp-equivalent-frame swp-small swp-right-margin">({equivalent.frame})</span>
    );
    let node = (
      <li className="swp-equivalent swp-text swp-list-item" key={`equivalent-${index}`}>
        {categoryNode}
        {frameNode}
        {WordPane.intersperse(equivalent.names, ", ")}
      </li>
    );
    return node;
  }

  private renderInformation(information: Information<ReactNode>, index: number): ReactNode {
    let textNode = (() => {
      if (information.kind === "phrase") {
        let textNode = <Fragment>{information.expression}{" → "}{WordPane.intersperse(information.equivalents, ", ")}</Fragment>;
        return textNode;
      } else if (information.kind === "example") {
        let textNode = <Fragment>{information.sentence}{" → "}{information.translation}</Fragment>;
        return textNode;
      } else {
        let textNode = information.text;
        return textNode;
      }
    })();
    let node = (
      <div className="swp-information swp-section-item" key={`information-${index}`}>
        <div className="swp-information-kind swp-small-head">
          <span className="swp-information-kind-inner swp-small-head-inner">{InformationKindUtil.getName(information.kind, this.props.language)}</span>
        </div>
        <div className="swp-information-text swp-text">
          {textNode}
        </div>
      </div>
    );
    return node;
  }

  private renderRelation(relation: Relation<ReactNode>, index: number): ReactNode {
    let titleNode = (relation.title !== null) && (
      <span className="swp-relation-title swp-tag swp-right-margin">{relation.title}</span>
    );
    let node = (
      <li className="swp-relation swp-text swp-list-item" key={`relation-${index}`}>
        {titleNode}
        {WordPane.intersperse(relation.names, ", ")}
      </li>
    );
    return node;
  }

  private renderWord(word: ParsedWord<ReactNode>, markers: Array<Marker>): ReactNode {
    let headNode = this.renderHead(word, markers);
    let className = "swp-word" + ((markers.length > 0) ? ` swp-word-${markers[markers.length - 1]}` : "");
    let sectionNodes = word.parts[this.props.language]?.sections.map((section, index) => this.renderSection(section, index));
    let sectionNode = (sectionNodes !== undefined && sectionNodes.length > 0) && (
      <div className="swp-sections">
        {sectionNodes}
      </div>
    );
    let node = (
      <div className={className} onClick={this.props.onClick} onDoubleClick={this.props.onDoubleClick}>
        {headNode}
        {sectionNode}
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let markupResolvers = this.createMarkupResolvers();
    let word = this.props.word.parse(markupResolvers);
    let markers = this.props.dictionary.getMarkers(this.props.word.name);
    let node = this.renderWord(word, markers);
    return node;
  }

  private static intersperse(nodes: ReadonlyArray<ReactNode>, separator: ReactNode): Array<ReactNode> {
    let resultNodes = [];
    for (let i = 0 ; i < nodes.length ; i ++) {
      if (i !== 0) {
        resultNodes.push(separator);
      }
      resultNodes.push(nodes[i]);
    }
    return resultNodes;
  }

}


type Props = {
  dictionary: Dictionary,
  word: Word,
  language: string,
  onClick?: (event: MouseEvent<HTMLDivElement>) => void,
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};