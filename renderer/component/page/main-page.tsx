//

import {
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Dictionary,
  NormalWordParameter,
  Word,
  WordParameter
} from "../../module";
import {
  debounce
} from "../../util/decorator";
import {
  Component
} from "../component";
import {
  Loading,
  WordList,
  SearchForm
} from "../compound";


export class MainPage extends Component<Props, State> {

  public state: State = {
    dictionary: null,
    parameter: NormalWordParameter.createEmpty("ja"),
    hitResult: {words: [], suggestions: []},
    progress: 0
  }

  public componentDidMount(): void {
    this.loadDictionary();
  }

  private loadDictionary(): void {
    window.api.send("ready-get-dictionary", "C:/Users/Ziphil/Desktop/dic");
    window.api.on("get-dictionary-progress", (event, progress) => {
      this.setState({progress});
    });
    window.api.on("get-dictionary", (event, plainDictionary) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      this.setState({dictionary}, () => {
        this.updateWordsImmediately();
      });
    });
  }

  private updateWordsImmediately(): void {
    let parameter = this.state.parameter;
    let hitWords = this.state.dictionary!.words.filter((word) => parameter.match(word));
    let hitResult = {words: hitWords, suggestions: []};
    this.setState({hitResult});
  }

  @debounce(300)
  private updateWords(): void {
    this.updateWordsImmediately();
  }

  private handleParameterSet(parameter: WordParameter): void {
    this.setState({parameter}, () => {
      this.updateWords();
    });
  }

  private renderNavbar(): ReactNode {
    let node = (
      <Navbar fixedToTop={true}>
        <NavbarGroup align="left">
          <NavbarHeading>
            <strong>シャレイア語辞典</strong>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="left">
          <Button text="ファイル" minimal={true}/>
          <Button text="検索" minimal={true}/>
          <Button text="編集" minimal={true}/>
        </NavbarGroup>
      </Navbar>
    );
    return node;
  }

  public render(): ReactNode {
    let navbarNode = this.renderNavbar();
    let node = (
      <div className="zp-main-page zp-root zp-navbar-root">
        {navbarNode}
        <Loading loading={this.state.dictionary === null} progress={this.state.progress}>
          <div className="zp-search-form-container">
            <SearchForm parameter={this.state.parameter} onParameterSet={this.handleParameterSet.bind(this)}/>
          </div>
          <div className="zp-word-list-container" id="word-list-container">
            <WordList words={this.state.hitResult.words} language="ja"/>
          </div>
        </Loading>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
  dictionary: Dictionary | null,
  parameter: WordParameter,
  hitResult: {words: Array<Word>, suggestions: Array<null>},
  progress: number
};