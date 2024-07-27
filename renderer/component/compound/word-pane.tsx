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
  ExampleInformation,
  InformationKindUtil,
  Marker,
  MarkupResolver,
  NormalInformation,
  ParsedWord,
  Parser,
  PhraseInformation,
  Relation,
  Section,
  Word
} from "soxsot";
import {
  MarkerIcon
} from "../atom/marker-icon";


export class WordPane extends Component<Props, State> {

  private renderMarker(marker: Marker): ReactNode {
    const node = (
      <div className={`swp-head-marker swp-marker swp-marker-${marker}`} key={marker}>
        <MarkerIcon marker={marker}/>
      </div>
    );
    return node;
  }

  private renderHead(word: ParsedWord<ReactNode>, markers: Array<Marker>): ReactNode {
    const sort = word.parts[this.props.language]?.sort ?? null;
    const bracketClassName = (this.props.useCustomFont) ? "swp-shaleian" : "swp-sans";
    const markerNodes = markers.map((marker) => this.renderMarker(marker));
    const categoryNode = (sort !== null) && (
      <span className="swp-head-sort swp-tag swp-right-margin">{sort}</span>
    );
    const nameNode = (
      <span className="swp-head-name swp-right-margin">
        <span className={bracketClassName}>{word.name}</span>
      </span>
    );
    const pronunciationNode = (word.pronunciation !== null) && (
      <span className="swp-head-pronunciation swp-right-margin">
        /{word.pronunciation}/
      </span>
    );
    const dateNode = (
      <span className="swp-head-date swp-hairia">{word.date}</span>
    );
    const markerNode = (
      <div className="swp-head-markers swp-markers">
        {markerNodes}
      </div>
    );
    const node = (
      <div className="swp-head">
        <div className="swp-head-left">
          {categoryNode}
          {nameNode}
          {pronunciationNode}
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
    const equivalents = section.getEquivalents(true);
    const normalInformations = section.getNormalInformations(true).filter((information) => information.kind !== "task" && information.kind !== "history");
    const appendixInformations = section.getNormalInformations(true).filter((information) => information.kind === "task" || information.kind === "history");
    const phraseInformations = section.getPhraseInformations(true);
    const exampleInformations = section.getExampleInformations(true);
    const relations = section.relations;
    const equivalentNodes = equivalents.map((equivalent, index) => this.renderEquivalent(equivalent, index));
    const normalInformationNodes = normalInformations.map((information, index) => this.renderNormalInformation(information, index));
    const appendixInformationNodes = appendixInformations.map((information, index) => this.renderNormalInformation(information, index));
    const phraseInformationNode = this.renderPhraseInformations(phraseInformations);
    const exampleInformationNode = this.renderExampleInformations(exampleInformations);
    const relationNodes = relations.map((relation, index) => this.renderRelation(relation, index));
    const equivalentNode = (equivalents.length > 0) && (
      <ul className="swp-equivalents swp-section-item swp-list">
        {equivalentNodes}
      </ul>
    );
    const relationNode = (section.relations.length > 0) && (
      <ul className="swp-relations swp-section-item swp-list">
        {relationNodes}
      </ul>
    );
    const appendixNode = (appendixInformations.length > 0) && (
      <div className="swp-appendix swp-section-item">
        {appendixInformationNodes}
      </div>
    );
    const node = (
      <div className="swp-section" key={`section-${index}`}>
        {equivalentNode}
        {normalInformationNodes}
        {phraseInformationNode}
        {exampleInformationNode}
        {relationNode}
        {appendixNode}
      </div>
    );
    return node;
  }

  private renderEquivalent(equivalent: Equivalent<ReactNode>, index: number): ReactNode {
    const categoryNode = (equivalent.category !== null) && (
      <span className="swp-equivalent-category swp-tag swp-right-margin">{equivalent.category}</span>
    );
    const frameNode = (equivalent.frame !== null) && (
      <span className="swp-equivalent-frame swp-small swp-right-margin">({equivalent.frame})</span>
    );
    const nameNodes = equivalent.names.map((name, index) => {
      const nameNode = (
        <Fragment key={`equivalent-inner-${index}`}>
          {name}
        </Fragment>
      );
      return nameNode;
    });
    const node = (
      <li className="swp-equivalent swp-text swp-list-item" key={`equivalent-${index}`}>
        {categoryNode}
        {frameNode}
        {WordPane.intersperse(nameNodes, ", ")}
      </li>
    );
    return node;
  }

  private renderNormalInformation(information: NormalInformation<ReactNode>, index: number): ReactNode {
    const date = information.date;
    const dateNode = (date !== null) && (
      <span className="swp-left-margin">
        <span className="swp-hairia">{date}</span>
      </span>
    );
    const node = (
      <div className="swp-information swp-section-item" key={`information-${index}`}>
        <div className="swp-information-kind swp-small-head">
          <span className="swp-information-kind-inner swp-small-head-inner">
            {InformationKindUtil.getName(information.kind, this.props.language)}
            {dateNode}
          </span>
        </div>
        <div className="swp-information-text swp-text">
          {information.text}
        </div>
      </div>
    );
    return node;
  }

  private renderPhraseInformations(informations: ReadonlyArray<PhraseInformation<ReactNode>>): ReactNode {
    const innerNodes = informations.map((information, index) => {
      const expressionNode = (
        <dt className="swp-phrase-expression">
          {information.expression}
          <span className="swp-phrease-divider">—</span>
          {information.equivalentNames.join(", ")}
        </dt>
      );
      const textNode = (information.text !== null) && (
        <dd className="swp-phrase-inner-text">
          {information.text}
        </dd>
      );
      const innerNode = (
        <Fragment key={`phrase-inner-${index}`}>
          {expressionNode}
          {textNode}
        </Fragment>
      );
      return innerNode;
    });
    const node = (informations.length > 0) && (
      <div className="swp-information swp-section-item" key="information-phrase">
        <div className="swp-information-kind swp-small-head">
          <span className="swp-information-kind-inner swp-small-head-inner">{InformationKindUtil.getName("phrase", this.props.language)}</span>
        </div>
        <dl className="swp-phrase-text swp-information-text swp-text">
          {innerNodes}
        </dl>
      </div>
    );
    return node;
  }

  private renderExampleInformations(informations: ReadonlyArray<ExampleInformation<ReactNode>>): ReactNode {
    const innerNodes = informations.map((information, index) => {
      const sentenceNode = (
        <dt className="swp-example-sentence">
          {information.sentence}
        </dt>
      );
      const translationNode = (
        <dd className="swp-example-translation">
          {information.translation}
        </dd>
      );
      const innerNode = (
        <Fragment key={`example-inner-${index}`}>
          {sentenceNode}
          {translationNode}
        </Fragment>
      );
      return innerNode;
    });
    const node = (informations.length > 0) && (
      <div className="swp-information swp-section-item" key="information-example">
        <div className="swp-information-kind swp-small-head">
          <span className="swp-information-kind-inner swp-small-head-inner">{InformationKindUtil.getName("example", this.props.language)}</span>
        </div>
        <dl className="swp-example-text swp-information-text swp-text">
          {innerNodes}
        </dl>
      </div>
    );
    return node;
  }

  private renderRelation(relation: Relation<ReactNode>, index: number): ReactNode {
    const titleNode = (relation.title !== null) && (
      <span className="swp-relation-title swp-tag swp-right-margin">{relation.title}</span>
    );
    const entryNodes = relation.entries.map((entry, index) => {
      const referNode = entry.refer && <span className="swp-refer">*</span>;
      const entryNode = (
        <Fragment key={`relation-inner-${index}`}>
          {entry.name}
          {referNode}
        </Fragment>
      );
      return entryNode;
    });
    const node = (
      <li className="swp-relation swp-text swp-list-item" key={`relation-${index}`}>
        {titleNode}
        {WordPane.intersperse(entryNodes, ", ")}
      </li>
    );
    return node;
  }

  private renderWord(word: ParsedWord<ReactNode>, markers: Array<Marker>): ReactNode {
    const headNode = this.renderHead(word, markers);
    const className = "swp-word" + ((markers.length > 0) ? ` swp-word-${markers[markers.length - 1]}` : "");
    const sectionNodes = word.parts[this.props.language]?.sections.map((section, index) => this.renderSection(section, index));
    const sectionNode = (sectionNodes !== undefined && sectionNodes.length > 0) && (
      <div className="swp-sections">
        {sectionNodes}
      </div>
    );
    const node = (
      <div className={className} onClick={this.props.onClick} onDoubleClick={this.props.onDoubleClick}>
        {headNode}
        {sectionNode}
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    const resolver = WordPane.createMarkupResolver(this.props.useCustomFont, this.props.onLinkClick);
    const parser = new Parser(resolver, {pronouncerConfigs: {showSyllables: true}});
    const word = parser.parse(this.props.word);
    const markers = this.props.word.markers;
    const node = this.renderWord(word, markers);
    return node;
  }

  public static createMarkupResolver(useCustomFont: boolean, onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void): MarkupResolver<ReactNode, ReactNode> {
    const onLinkAltClick = WordPane.requireAlt(onLinkClick);
    const bracketClassName = (useCustomFont) ? "swp-shaleian" : "swp-sans";
    const resolveLink = function (name: string, children: Array<ReactNode | string>): ReactNode {
      const node = <span className="swp-link" key={Math.random()} onMouseDown={onLinkAltClick && partial(onLinkAltClick, name)}>{children}</span>;
      return node;
    };
    const resolveBracket = function (children: Array<ReactNode | string>): ReactNode {
      const node = <span className={bracketClassName} key={Math.random()}>{children}</span>;
      return node;
    };
    const resolveSlash = function (string: string): ReactNode {
      const node = <span className="swp-italic" key={Math.random()}>{string}</span>;
      return node;
    };
    const resolveHairia = function (hairia: number): ReactNode {
      const node = <span className="swp-hairia" key={Math.random()}>{hairia}</span>;
      return node;
    };
    const join = function (nodes: Array<ReactNode | string>): ReactNode {
      return nodes;
    };
    const modifyPunctuations = true;
    const resolver = new MarkupResolver({resolveLink, resolveBracket, resolveSlash, resolveHairia, join, modifyPunctuations});
    return resolver;
  }

  public static requireAlt<A extends Array<any>, T>(handler?: (...args: [...A, MouseEvent<T>]) => void): ((...args: [...A, MouseEvent<T>]) => void) | undefined {
    if (handler !== undefined) {
      const resultHandler = function (...args: [...A, MouseEvent<T>]): void {
        if (args[args.length - 1].altKey) {
          handler(...args);
        }
      };
      return resultHandler;
    } else {
      return undefined;
    }
  }

  public static intersperse(nodes: ReadonlyArray<ReactNode>, separator: ReactNode): Array<ReactNode> {
    const resultNodes = [];
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
  useCustomFont: boolean,
  onClick?: (event: MouseEvent<HTMLDivElement>) => void,
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};