//

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
  MarkupResolvers,
  ParsedWord,
  Relation,
  Section,
  Word
} from "../../module";


export class WordPane extends Component<Props, State> {

  private createMarkupResolvers(): MarkupResolvers<ReactNode, ReactNode> {
    let resolveLink = function (name: string, children: Array<ReactNode | string>): ReactNode {
      let node = <span>{children}</span>;
      return node;
    }
    let resolveBracket = function (children: Array<ReactNode | string>): ReactNode {
      let node = <span className="swp-sans">{children}</span>;
      return node;
    }
    let resolveSlash = function (string: string): ReactNode {
      let node = <span className="swp-italic">{string}</span>;
      return node;
    }
    let join = function (nodes: Array<ReactNode | string>): ReactNode {
      return nodes;
    }
    let resolvers = new MarkupResolvers(resolveLink, resolveBracket, resolveSlash, join);
    return resolvers;
  }

  private renderHead(word: ParsedWord<ReactNode>): ReactNode {
    let lexicalCategory = word.parts[this.props.language]?.lexicalCategory ?? null;
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
    let categoryNode = (equivalent.category !== null) && (
      <span className="swp-equivalent-category swp-tag swp-right-margin">{equivalent.category}</span>
    );
    let frameNode = (equivalent.frame !== null) && (
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
    let titleNode = (relation.title !== null) && (
      <span className="swp-relation-title swp-tag swp-right-margin">{relation.title}</span>
    );
    let node = (
      <li className="swp-relation swp-text swp-list-item">
        {titleNode}
        {WordPane.intersperse(relation.names, ", ")}
      </li>
    );
    return node;
  }

  private renderWord(word: ParsedWord<ReactNode>): ReactNode {
    let headNode = this.renderHead(word);
    let sectionNodes = word.parts[this.props.language]?.sections.map((section) => this.renderSection(section));
    let sectionNode = (sectionNodes !== undefined && sectionNodes.length > 0) && (
      <div className="swp-sections">
        {sectionNodes}
      </div>
    );
    let node = (
      <div className="swp-word">
        {headNode}
        {sectionNode}
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let markupResolvers = this.createMarkupResolvers();
    let word = this.props.word.parse(markupResolvers);
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