//

import {
  IRefObject,
  Toaster
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Dictionary,
  Marker,
  NormalWordParameter,
  PlainDictionarySettings,
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
  EnhancedProgressBar
} from "../atom";
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

  private searchInputRef: IRefObject<HTMLInputElement>;

  public state: State = {
    dictionary: null,
    activeWord: null,
    language: "ja",
    parameter: NormalWordParameter.createEmpty("ja"),
    hitResult: {words: [], suggestions: []},
    loadProgress: {offset: 0, size: 0},
    saveProgress: {offset: 0, size: 0}
  };

  public constructor(props: Props) {
    super(props);
    this.searchInputRef = {current: null};
    this.setupIpc();
  }

  public componentDidMount(): void {
    this.loadDictionary("C:/Users/Ziphil/Desktop/dic");
  }

  private setupIpc(): void {
    window.api.on("get-load-dictionary-progress", (event, loadProgress) => {
      this.setState({loadProgress});
    });
    window.api.on("load-dictionary", (event, plainDictionary) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      let activeWord = null;
      this.setState({dictionary, activeWord}, () => {
        this.updateWords();
      });
    });
    window.api.on("error-load-dictionary", (event, error) => {
      CustomToaster.show({message: this.trans("mainPage.errorLoadDictionary"), icon: "error", intent: "danger"});
    });
    window.api.on("get-save-dictionary-progress", (event, saveProgress) => {
      let message = <EnhancedProgressBar className="zp-save-progress-bar" offset={saveProgress.offset} size={saveProgress.size} showDetail={false}/>;
      CustomToaster.show({message, icon: "floppy-disk", timeout: 0}, "saveDictionary");
    });
    window.api.on("save-dictionary", (event) => {
      let message = <EnhancedProgressBar className="zp-save-progress-bar" offset={1} size={1} showDetail={false}/>;
      CustomToaster.show({message, icon: "floppy-disk"}, "saveDictionary");
    });
    window.api.on("edit-word", (event, uid, word) => {
      this.editWord(uid, word);
    });
    window.api.on("delete-word", (event, uid) => {
      this.deleteWord(uid);
    });
    window.api.on("change-dictionary-settings", (event, settings) => {
      this.changeDictionarySettings(settings);
    });
    window.api.on("succeed-git-commit", (event) => {
      CustomToaster.show({message: this.trans("mainPage.succeedGitCommit"), icon: "tick", intent: "success"});
    });
    window.api.on("succeed-git-push", (event) => {
      CustomToaster.show({message: this.trans("mainPage.succeedGitPush"), icon: "tick", intent: "success"});
    });
  }

  private loadDictionary(path: string): void {
    let dictionary = null;
    let activeWord = null;
    let loadProgress = {offset: 0, size: 0};
    this.setState({dictionary, activeWord, loadProgress});
    window.api.send("ready-load-dictionary", path);
  }

  private reloadDictionary(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null && dictionary.path !== null) {
      let path = dictionary.path;
      this.loadDictionary(path);
    }
  }

  private saveDictionary(path: string | null): void {
    let dictionary = this.state.dictionary;
    window.api.send("ready-save-dictionary", dictionary, "C:/Users/Ziphil/Desktop/dic_save");
  }

  private refreshWords(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let hitResult = {words: this.state.hitResult.words, suggestions: this.state.hitResult.suggestions};
      this.setState({hitResult});
    }
  }

  private updateWords(parameter?: WordParameter): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let hitResult = dictionary.search(parameter ?? this.state.parameter);
      let activeWord = null;
      this.setState({hitResult, activeWord}, () => {
        document.getElementById("word-list-container")!.scrollTop = 0;
      });
    }
  }

  @debounce(200)
  private updateWordsDebounced(): void {
    this.updateWords();
  }

  private updateWordsByName(name: string): void {
    let parameter = new NormalWordParameter(name, "name", "exact", this.state.language);
    this.updateWords(parameter);
  }

  private focusSearchForm(): void {
    let element = this.searchInputRef.current;
    if (element !== null) {
      element.focus();
      this.setState({activeWord: null});
    }
  }

  private startEditWord(word: PlainWord | null, defaultWord?: PlainWord): void {
    let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
    this.createWindow("editor", {word, defaultWord}, options);
  }

  private startEditActiveWord(word: PlainWord | "active" | null, defaultWord?: PlainWord | "active"): void {
    let activeWord = this.state.activeWord;
    if (activeWord !== null) {
      let nextWord = (word === "active") ? activeWord : word;
      let nextDefaultWord = (defaultWord === "active") ? activeWord : defaultWord;
      this.startEditWord(nextWord, nextDefaultWord);
    } else {
      CustomToaster.show({message: this.trans("mainPage.noActiveWord"), icon: "warning-sign", intent: "warning"});
    }
  }

  private editWord(uid: string | null, word: PlainWord): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.editWord(uid, word);
      this.refreshWords();
    }
  }

  private deleteWord(uid: string): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.deleteWord(uid);
      this.refreshWords();
    }
  }

  private deleteActiveWord(): void {
    let activeWord = this.state.activeWord;
    if (activeWord !== null) {
      this.deleteWord(activeWord.uid);
    } else {
      CustomToaster.show({message: this.trans("mainPage.noActiveWord"), icon: "warning-sign", intent: "warning"});
    }
  }

  private toggleWordMarker(word: Word, marker: Marker): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.toggleMarker(word.name, marker);
      this.refreshWords();
    }
  }

  private toggleActiveWordMarker(marker: Marker): void {
    let activeWord = this.state.activeWord;
    if (activeWord !== null) {
      this.toggleWordMarker(activeWord, marker);
    } else {
      CustomToaster.show({message: this.trans("mainPage.noActiveWord"), icon: "warning-sign", intent: "warning"});
    }
  }

  private changeParameter(parameter: WordParameter, immediate?: boolean): void {
    this.setState({parameter}, () => {
      if (immediate) {
        this.updateWords();
      } else {
        this.updateWordsDebounced();
      }
    });
  }

  private changeWordMode(mode: WordMode, focus?: boolean): void {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, mode, oldParameter.type, oldParameter.language);
    this.changeParameter(parameter);
    if (focus) {
      this.focusSearchForm();
    }
  }

  private changeWordType(type: WordType, focus?: boolean): void {
    let oldParameter = WordParameter.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, oldParameter.mode, type, oldParameter.language);
    this.changeParameter(parameter);
    if (focus) {
      this.focusSearchForm();
    }
  }

  private shuffleWords(): void {
    let parameter = this.state.parameter;
    parameter.shuffle = true;
    this.changeParameter(parameter, true);
  }

  private startChangeDictionarySettings(): void {
    let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
    let dictionary = this.state.dictionary;
    this.createWindow("dictionary-settings", {dictionary}, options);
  }

  private changeDictionarySettings(settings: PlainDictionarySettings): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.changeSettings(settings);
    }
  }

  private gitCommit(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let path = dictionary.path;
      window.api.send("git-commit", path, "");
    }
  }

  private gitPush(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      window.api.send("git-push");
    }
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-main-page zp-root zp-navbar-root">
        <MainNavbar
          reloadDictionary={() => this.reloadDictionary()}
          saveDictionary={() => this.saveDictionary(null)}
          changeWordMode={(mode) => this.changeWordMode(mode, true)}
          changeWordType={(type) => this.changeWordType(type, true)}
          shuffleWords={() => this.shuffleWords()}
          createWord={() => this.startEditWord(null)}
          inheritActiveWord={() => this.startEditActiveWord(null, "active")}
          editActiveWord={() => this.startEditActiveWord("active")}
          deleteActiveWord={() => this.deleteActiveWord()}
          toggleActiveWordMarker={(marker) => this.toggleActiveWordMarker(marker)}
          gitCommit={() => this.gitCommit()}
          gitPush={() => this.gitPush()}
          openDictionarySettings={() => this.startChangeDictionarySettings()}
        />
        <Loading loading={this.state.dictionary === null} {...this.state.loadProgress}>
          <div className="zp-search-form-container">
            <SearchForm parameter={this.state.parameter} inputRef={this.searchInputRef} onParameterSet={this.changeParameter.bind(this)}/>
          </div>
          <div className="zp-word-list-container" id="word-list-container">
            <WordList
              dictionary={this.state.dictionary!}
              words={this.state.hitResult.words}
              activeWord={this.state.activeWord}
              language={this.state.language}
              onCreate={() => this.startEditWord(null)}
              onInherit={(word) => this.startEditWord(null, word)}
              onEdit={(word) => this.startEditWord(word)}
              onDelete={(word) => this.deleteWord(word.uid)}
              onMarkerToggled={(word, marker) => this.toggleWordMarker(word, marker)}
              onLinkClick={(name) => this.updateWordsByName(name)}
              onActivate={(activeWord) => this.setState({activeWord})}
            />
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
  language: string,
  activeWord: Word | null,
  parameter: WordParameter,
  hitResult: {words: Array<Word>, suggestions: Array<null>},
  loadProgress: {offset: number, size: number},
  saveProgress: {offset: number, size: number}
};

let CustomToaster = Toaster.create({className: "zp-main-toaster", position: "top", maxToasts: 2});