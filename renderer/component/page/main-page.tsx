//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Dictionary,
  NormalWordParameter,
  Word,
  WordMode,
  WordParameter,
  WordType
} from "../../module";
import {
  debounce
} from "../../util/decorator";
import {
  Component
} from "../component";
import {
  Loading,
  MainNavbar,
  SearchForm,
  WordList
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class MainPage extends Component<Props, State> {

  public state: State = {
    dictionary: null,
    parameter: NormalWordParameter.createEmpty("ja"),
    hitResult: {words: [], suggestions: []},
    progress: {offset: 0, size: 0}
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
    let hitResult = this.state.dictionary!.search(this.state.parameter);
    this.setState({hitResult});
  }

  @debounce(200)
  private updateWords(): void {
    this.updateWordsImmediately();
  }

  private changeParameter(parameter: WordParameter): void {
    this.setState({parameter}, () => {
      this.updateWords();
    });
  }

  private changeWordMode(mode: WordMode) {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, mode, oldParameter.type, oldParameter.language);
    this.changeParameter(parameter);
  }

  private changeWordType(type: WordType) {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, oldParameter.mode, type, oldParameter.language);
    this.changeParameter(parameter);
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-main-page zp-root zp-navbar-root">
        <MainNavbar
          changeWordMode={this.changeWordMode.bind(this)}
          changeWordType={this.changeWordType.bind(this)}
        />
        <Loading loading={this.state.dictionary === null} {...this.state.progress}>
          <div className="zp-search-form-container">
            <SearchForm parameter={this.state.parameter} onParameterSet={this.changeParameter.bind(this)}/>
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
  progress: {offset: number, size: number}
};