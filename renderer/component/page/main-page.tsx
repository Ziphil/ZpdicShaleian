//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Dictionary,
  NormalWordParameter,
  PlainWord,
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

  public constructor(props: Props) {
    super(props);
    this.setupIpc();
  }

  public componentDidMount(): void {
    let path = "C:/Users/Ziphil/Desktop/dic";
    this.loadDictionary(path);
  }

  private setupIpc(): void {
    window.api.on("get-dictionary-progress", (event, progress) => {
      this.setState({progress});
    });
    window.api.on("get-dictionary", (event, plainDictionary) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      this.setState({dictionary}, () => {
        this.updateWordsImmediately();
      });
    });
    window.api.on("edit-word", (event, uid, word) => {
      this.editWord(uid, word);
    });
    window.api.on("delete-word", (event, uid) => {
      this.deleteWord(uid);
    });
  }

  private loadDictionary(path: string): void {
    window.api.send("ready-get-dictionary", path);
  }

  private updateWordsImmediately(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let hitResult = dictionary.search(this.state.parameter);
      this.setState({hitResult});
    }
  }

  @debounce(200)
  private updateWords(): void {
    this.updateWordsImmediately();
  }

  private editWord(uid: string | null, word: PlainWord): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.editWord(uid, word);
      this.updateWordsImmediately();
    }
  }

  private deleteWord(uid: string): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.deleteWord(uid);
      this.updateWordsImmediately();
    }
  }

  private changeParameter(parameter: WordParameter): void {
    this.setState({parameter}, () => {
      this.updateWords();
    });
  }

  private changeWordMode(mode: WordMode): void {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, mode, oldParameter.type, oldParameter.language);
    this.changeParameter(parameter);
  }

  private changeWordType(type: WordType): void {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, oldParameter.mode, type, oldParameter.language);
    this.changeParameter(parameter);
  }

  private openWordEditor(word: Word): void {
    let options = {width: 640, height: 480, minWidth: 640, minHeight: 480, type: "toolbar"};
    this.createWindow("editor", {word}, options);
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
            <WordList words={this.state.hitResult.words} language="ja" onDoubleClick={this.openWordEditor.bind(this)}/>
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