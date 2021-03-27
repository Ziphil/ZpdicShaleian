//

import {
} from "@blueprintjs/core";
import * as react from "react";
import {
  Fragment,
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  Equivalent,
  Information,
  InformationKindUtil,
  MarkupReducers,
  ParsedWord,
  Relation,
  Section,
  Word
} from "../../module";


export class WordPane extends Component<Props, State> {

  private createMarkupReducers(): MarkupReducers<ReactNode, ReactNode> {
    let reduceLink = function (name: string, children: Array<ReactNode | string>): ReactNode {
      let node = <span>{children}</span>;
      return node;
    }
    let reduceBracket = function (children: Array<ReactNode | string>): ReactNode {
      let node = <span className="swp-sans">{children}</span>;
      return node;
    }
    let reduceSlash = function (string: string): ReactNode {
      let node = <span className="swp-italic">{string}</span>;
      return node;
    }
    let join = function (nodes: Array<ReactNode | string>): ReactNode {
      return nodes;
    }
    let reducers = new MarkupReducers(reduceLink, reduceBracket, reduceSlash, join);
    return reducers;
  }

  private renderHead(word: ParsedWord<ReactNode>): ReactNode {
    let lexicalCategory = word.parts.get(this.props.language)!.lexicalCategory;
    let categoryNode = (lexicalCategory !== null) && (
      <span className="swp-head-category swp-tag swp-right-margin">{lexicalCategory}</span>
    );
    let nameNode = (
      <span className="swp-head-name">
        <span className="swp-sans">{word.name}</span>
      </span>
    );
    let node = (
      <div className="swp-head">
        {categoryNode}
        {nameNode}
      </div>
    );
    return node;
  }

  private renderSection(section: Section<ReactNode>): ReactNode {
    let equivalentNodes = section.equivalents.filter((equivalent) => !equivalent.hidden).map((equivalent) => this.renderEquivalent(equivalent));
    let informationNodes = section.informations.map((information) => this.renderInformation(information));
    let relationNodes = section.relations.map((relation) => this.renderRelation(relation));
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
      <div className="swp-section">
        {equivalentNode}
        {informationNode}
        {relationNode}
      </div>
    );
    return node;
  }

  private renderEquivalent(equivalent: Equivalent<ReactNode>): ReactNode {
    let categoryNode = (equivalent.category !== "") && (
      <span className="swp-equivalent-category swp-tag swp-right-margin">{equivalent.category}</span>
    );
    let frameNode = (equivalent.frame !== "") && (
      <span className="swp-equivalent-frame swp-small swp-right-margin">({equivalent.frame})</span>
    );
    let node = (
      <li className="swp-equivalent swp-text swp-list-item">
        {categoryNode}
        {frameNode}
        {WordPane.intersperse(equivalent.names, ", ")}
      </li>
    );
    return node;
  }

  private renderInformation(information: Information<ReactNode>): ReactNode {
    let textNode = (() => {
      if (information.kind === "phrase") {
        let textNode = [information.expression, " → ", WordPane.intersperse(information.equivalents, ", ")];
        return textNode;
      } else if (information.kind === "example") {
        let textNode = [information.sentence, " → ", information.translation];
        return textNode;
      } else {
        let textNode = information.text;
        return textNode;
      }
    })();
    let node = (
      <div className="swp-information swp-section-item">
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

  private renderRelation(relation: Relation<ReactNode>): ReactNode {
    let node = (
      <li className="swp-relation swp-text swp-list-item">
        <span className="swp-relation-title swp-tag swp-right-margin">{relation.title}</span>
        {WordPane.intersperse(relation.names, ", ")}
      </li>
    );
    return node;
  }

  private renderWord(word: ParsedWord<ReactNode>): ReactNode {
    let headNode = this.renderHead(word);
    let sectionNodes = word.parts.get(this.props.language)!.sections.map((section) => this.renderSection(section));
    let node = (
      <div className="swp-word">
        {headNode}
        <div className="swp-sections">
          {sectionNodes}
        </div>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let markupReducers = this.createMarkupReducers();
    let word = this.props.word.toParsed(markupReducers);
    let node = this.renderWord(word);
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
  word: Word,
  language: string
};
type State = {
};