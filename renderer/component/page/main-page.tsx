//

import {
  Alert,
  IRefObject,
  Toaster
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode,
  RefObject,
  createRef
} from "react";
import {
  Dictionary,
  Marker,
  NormalWordParameter,
  PlainWord,
  SearchResult,
  Word,
  WordMode,
  WordParameter,
  WordType
} from "../../module/dictionary";
import {
  ArrayUtil
} from "../../util/array";
import {
  debounce
} from "../../util/decorator";
import {
  WordParameterUtil
} from "../../util/word-parameter";
import {
  EnhancedProgressBar,
  Progress
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
  component,
  handler,
  on,
  onAsync
} from "../decorator";


@component() @handler()
export class MainPage extends Component<Props, State> {

  private searchInputRef: IRefObject<HTMLInputElement> = createRef();
  private wordListRef: RefObject<HTMLDivElement> = createRef();
  private handleAlertClose!: (confirmed: boolean) => void;

  public state: State = {
    dictionary: null,
    activeWord: null,
    language: "ja",
    parameter: NormalWordParameter.createEmpty("ja"),
    searchResult: SearchResult.createEmpty(),
    page: 0,
    changed: false,
    alertOpen: false,
    progress: {offset: 0, size: 0}
  };

  public constructor(props: Props) {
    super(props);
    this.setupIpc();
    this.setupEventListener();
  }

  public async componentDidMount(): Promise<void> {
    let settings = await this.sendAsync("getSettings");
    let path = settings.defaultDictionaryPath;
    if (path !== undefined) {
      this.updateDictionary(path);
    }
  }

  private async setupEventListener(): Promise<void> {
    let packaged = await this.sendAsync("getPackaged");
    if (packaged) {
      window.addEventListener("beforeunload", (event) => {
        this.requestCloseWindow();
        event.returnValue = false;
      });
    }
  }

  private async loadDictionary(): Promise<void> {
    let confirmed = await this.checkLeave();
    if (confirmed) {
      let result = await this.sendAsync("showOpenDialog", {properties: ["openDirectory"]});
      if (!result.canceled) {
        let path = result.filePaths[0];
        this.updateDictionary(path);
      }
    }
  }

  private async reloadDictionary(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null && dictionary.path !== null) {
      let confirmed = await this.checkLeave();
      if (confirmed) {
        let path = dictionary.path;
        await this.updateDictionary(path);
      }
    }
  }

  @on("getLoadDictionaryProgress")
  private updateLoadDictionaryProgress(progress: Progress): void {
    this.setState({progress});
  }

  private async updateDictionary(path: string): Promise<void> {
    let dictionary = null;
    let progress = {offset: 0, size: 0};
    this.setState({dictionary, progress, activeWord: null, changed: false});
    try {
      let plainDictionary = await this.sendAsync("loadDictionary", path);
      let dictionary = Dictionary.fromPlain(plainDictionary);
      this.setState({dictionary}, () => {
        this.updateWords();
      });
    } catch (error) {
      console.error(error);
      CustomToaster.show({message: this.trans("mainPage.failLoadDictionary"), icon: "error", intent: "danger"});
    }
  }

  private async saveDictionary(path: string | null): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      try {
        await this.sendAsync("saveDictionary", dictionary.toPlain(), path);
        this.setState({changed: false});
        CustomToaster.show({message: this.trans("mainPage.succeedSaveDictionary"), icon: "tick", intent: "success"}, "saveDictionary");
      } catch (error) {
        console.error(error);
        CustomToaster.show({message: this.trans("mainPage.failLoadDictionary"), icon: "error", intent: "danger"}, "saveDictionary");
      }
    }
  }

  @on("getSaveDictionaryProgress")
  private updateSaveDictionaryProgress(progress: Progress): void {
    let message = <EnhancedProgressBar className="zpmnp-save-progress-bar" progress={progress} showDetail={false}/>;
    CustomToaster.show({message, icon: "floppy-disk", timeout: 0}, "saveDictionary");
  }

  private async exportDictionary(type: string): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let result = await this.sendAsync("showSaveDialog", {});
      if (!result.canceled) {
        let path = result.filePath;
        try {
          await this.sendAsync("exportDictionary", dictionary.toPlain(), path, type);
          CustomToaster.show({message: this.trans("mainPage.succeedExportDictionary"), icon: "tick", intent: "success"}, "exportDictionary");
        } catch (error) {
          console.error(error);
          CustomToaster.show({message: this.trans("mainPage.failExportDictionary"), icon: "tick", intent: "danger"}, "exportDictionary");
        }
      }
    }
  }

  @on("getExportDictionaryProgress")
  private updateExportDictionaryProgress(progress: Progress): void {
    let message = <EnhancedProgressBar className="zpmnp-save-progress-bar" progress={progress} showDetail={false}/>;
    CustomToaster.show({message, icon: "floppy-disk", timeout: 0}, "exportDictionary");
  }

  // 検索結果ペインを再描画します。
  // 引数の search に true を渡すと、現在の検索パラメータを用いて再検索することで表示する単語データの更新も行います。
  // 検索結果ペインのスクロール位置は変化しません。
  private refreshWords(search?: boolean): void {
    let dictionary = this.state.dictionary;
    if (!search || dictionary === null) {
      let searchResult = this.state.searchResult.copy();
      this.setState({searchResult});
    } else {
      let searchResult = dictionary.search(this.state.parameter);
      this.setState({searchResult});
    }
  }

  // 検索結果の単語リストをシャッフルします。
  // 検索結果ペインのスクロール位置はリセットされます。
  private shuffleWords(): void {
    let oldSearchResult = this.state.searchResult;
    let oldWords = this.state.searchResult.words;
    let words = ArrayUtil.shuffle([...oldWords]);
    let searchResult = new SearchResult(words, oldSearchResult.suggestions, oldSearchResult.elapsedTime);
    this.setState({searchResult, page: 0, activeWord: null});
    this.scrollWordList();
  }

  // 現在の検索パラメータを用いて検索結果ペインを更新します。
  // 引数の parameter に検索パラメータを渡すと、その引数の方を用いて (ステートに保持されている現在の検索パラメータを無視して) 検索結果ペインが更新されます。
  // 検索結果ペインのスクロール位置はリセットされます。
  private updateWords(parameter?: WordParameter): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let searchResult = dictionary.search(parameter ?? this.state.parameter);
      this.setState({searchResult, page: 0, activeWord: null});
      this.scrollWordList();
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

  private scrollWordList(): void {
    let wordListElement = this.wordListRef.current;
    if (wordListElement !== null) {
      wordListElement.scrollTop = 0;
    }
  }

  private movePage(spec: {page: number} | {difference: number} | "first" | "last"): void {
    let currentPage = this.state.page;
    let minPage = this.state.searchResult.minPage;
    let maxPage = this.state.searchResult.maxPage;
    let page = (() => {
      if (spec === "first") {
        return minPage;
      } else if (spec === "last") {
        return maxPage;
      } else if ("page" in spec) {
        return spec.page;
      } else {
        return currentPage + spec.difference;
      }
    })();
    let clampedPage = Math.max(Math.min(page, maxPage), 0);
    if (clampedPage !== currentPage) {
      this.setState({page: clampedPage});
      this.scrollWordList();
    }
  }

  private async editWord(word: Word | null, defaultWord?: Word): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
      let plainWord = (word !== null) ? word.toPlain() : null;
      let defaultPlainWord = (defaultWord !== undefined) ? defaultWord.toPlain() : undefined;
      let data = await this.createWindowAsync("editor", {word: plainWord, defaultWord: defaultPlainWord}, options);
      if (data !== null) {
        let {uid, newWord} = data;
        dictionary.editWord(uid, newWord);
        this.setState({changed: true});
        this.refreshWords(true);
      }
    }
  }

  private async editActiveWord(word: Word | "active" | null, defaultWord?: Word | "active"): Promise<void> {
    let activeWord = this.state.activeWord;
    if (activeWord !== null) {
      let nextWord = (word === "active") ? activeWord : word;
      let nextDefaultWord = (defaultWord === "active") ? activeWord : defaultWord;
      await this.editWord(nextWord, nextDefaultWord);
    } else {
      CustomToaster.show({message: this.trans("mainPage.noActiveWord"), icon: "warning-sign", intent: "warning"});
    }
  }

  private deleteWord(uid: string): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.deleteWord(uid);
      this.setState({changed: true});
      this.refreshWords(true);
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

  @onAsync("doValidateEditWord")
  private async validateEditWord(uid: string | null, word: PlainWord): Promise<string | null> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      return dictionary.validateEditWord(uid, word);
    } else {
      return "";
    }
  }

  private toggleWordMarker(word: Word, marker: Marker): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      word.toggleMarker(marker);
      this.setState({changed: true});
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
    let oldParameter = WordParameterUtil.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, mode, oldParameter.type, oldParameter.language);
    this.changeParameter(parameter);
    if (focus) {
      this.focusSearchForm();
    }
  }

  private changeWordType(type: WordType, focus?: boolean): void {
    let oldParameter = WordParameterUtil.getNormal(this.state.parameter);
    let parameter = new NormalWordParameter(oldParameter.search, oldParameter.mode, type, oldParameter.language);
    this.changeParameter(parameter);
    if (focus) {
      this.focusSearchForm();
    }
  }

  private changeLanguage(language: string, focus?: boolean): void {
    let parameter = this.state.parameter;
    parameter.language = language;
    this.setState({language});
    this.changeParameter(parameter);
    if (focus) {
      this.focusSearchForm();
    }
  }

  private async changeDictionarySettings(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
      let settings = dictionary.settings;
      let data = await this.createWindowAsync("dictionarySettings", {settings}, options);
      if (data !== null) {
        let newSettings = data;
        dictionary.changeSettings(newSettings);
        this.setState({changed: true});
      }
    }
  }

  private async execGitCommit(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null && dictionary.path !== null) {
      let options = {width: 480, height: 400, minWidth: 320, minHeight: 240, type: "toolbar"};
      let path = dictionary.path;
      let data = await this.createWindowAsync("gitCommit", {path}, options);
      if (data !== null) {
        let message = data;
        try {
          await this.sendAsync("execGitCommit", path, message);
          CustomToaster.show({message: this.trans("mainPage.succeedExecGitCommit"), icon: "tick", intent: "success"});
        } catch (error) {
          console.error(error);
          CustomToaster.show({message: this.trans("mainPage.failExecGitCommit"), icon: "error", intent: "danger"});
        }
      }
    }
  }

  private async execGitPush(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 480, height: 320, minWidth: 320, minHeight: 240, type: "toolbar"};
      let path = dictionary.path;
      let data = await this.createWindowAsync("gitPush", {path}, options);
      if (data !== null) {
        try {
          await this.sendAsync("execGitPush", path);
          CustomToaster.show({message: this.trans("mainPage.succeedExecGitPush"), icon: "tick", intent: "success"});
        } catch (error) {
          console.error(error);
          CustomToaster.show({message: this.trans("mainPage.failExecGitPush"), icon: "error", intent: "danger"});
        }
      }
    }
  }

  private async uploadDictionary(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 480, height: 320, minWidth: 320, minHeight: 240, type: "toolbar"};
      let data = await this.createWindowAsync("uploadDictionary", {}, options);
      if (data !== null) {
        let {url, password} = data;
        try {
          await this.sendAsync("uploadDictionary", dictionary.toPlain(), url, password);
          CustomToaster.show({message: this.trans("mainPage.succeedUploadDictionary"), icon: "tick", intent: "success"}, "uploadDictionary");
        } catch (error) {
          console.error(error);
          CustomToaster.show({message: this.trans("mainPage.failUploadDictionary"), icon: "error", intent: "danger"}, "uploadDictionary");
        }
      }
    }
  }

  @on("getUploadDictionaryProgress")
  private updateUploadDictionaryProgress(progress: Progress): void {
    let message = <EnhancedProgressBar className="zpmnp-save-progress-bar" progress={progress} showDetail={false}/>;
    CustomToaster.show({message, icon: "export", timeout: 0}, "uploadDictionary");
  }

  private showUnimplementedToaster(): void {
    CustomToaster.show({message: this.trans("mainPage.unimplemented"), icon: "warning-sign", intent: "warning"});
  }

  private async requestCloseWindow(): Promise<void> {
    let confirmed = await this.checkLeave();
    if (confirmed) {
      this.send("destroyWindow");
    }
  }

  private checkLeave(): Promise<boolean> {
    if (this.state.changed) {
      let promise = new Promise<boolean>((resolve, reject) => {
        this.handleAlertClose = function (confirmed: boolean): void {
          this.setState({alertOpen: false});
          resolve(confirmed);
        };
        this.setState({alertOpen: true});
      });
      return promise;
    } else {
      let promise = Promise.resolve(true);
      return promise;
    }
  }

  private renderNavbar(): ReactNode {
    let node = (
      <MainNavbar
        loadDictionary={() => this.loadDictionary()}
        reloadDictionary={() => this.reloadDictionary()}
        saveDictionary={() => this.saveDictionary(null)}
        exportDictionary={(type) => this.exportDictionary(type)}
        closeWindow={() => this.closeWindow()}
        changeWordMode={(mode) => this.changeWordMode(mode, true)}
        changeWordType={(type) => this.changeWordType(type, true)}
        changeLanguage={(language) => this.changeLanguage(language, true)}
        shuffleWords={() => this.shuffleWords()}
        moveFirstPage={() => this.movePage("first")}
        movePreviousPage={() => this.movePage({difference: -1})}
        moveNextPage={() => this.movePage({difference: 1})}
        moveLastPage={() => this.movePage("last")}
        createWord={() => this.editWord(null)}
        inheritActiveWord={() => this.editActiveWord(null, "active")}
        editActiveWord={() => this.editActiveWord("active")}
        deleteActiveWord={() => this.deleteActiveWord()}
        toggleActiveWordMarker={(marker) => this.toggleActiveWordMarker(marker)}
        execGitCommit={() => this.execGitCommit()}
        execGitPush={() => this.execGitPush()}
        uploadDictionary={() => this.uploadDictionary()}
        openDictionarySettings={() => this.changeDictionarySettings()}
        fallback={() => this.showUnimplementedToaster()}
      />
    );
    return node;
  }

  private renderAlert(): ReactNode {
    let node = (
      <Alert
        isOpen={this.state.alertOpen}
        cancelButtonText={this.trans("mainPage.alertCancel")}
        confirmButtonText={this.trans("mainPage.alertConfirm")}
        icon="warning-sign"
        intent="danger"
        canEscapeKeyCancel={true}
        canOutsideClickCancel={true}
        onCancel={() => this.handleAlertClose(false)}
        onConfirm={() => this.handleAlertClose(true)}
      >
        <p>{this.trans("mainPage.alert")}</p>
      </Alert>
    );
    return node;
  }

  public render(): ReactNode {
    let navbarNode = this.renderNavbar();
    let alertNode = this.renderAlert();
    let node = (
      <div className="zpmnp-root zp-root zp-navbar-root">
        {navbarNode}
        {alertNode}
        <Loading loading={this.state.dictionary === null} progress={this.state.progress}>
          <div className="zpmnp-search-form-container">
            <SearchForm
              parameter={this.state.parameter}
              searchResult={this.state.searchResult}
              inputRef={this.searchInputRef}
              onParameterSet={this.changeParameter.bind(this)}
            />
          </div>
          <div className="zpmnp-word-list-container" ref={this.wordListRef}>
            <WordList
              dictionary={this.state.dictionary!}
              searchResult={this.state.searchResult}
              language={this.state.language}
              page={this.state.page}
              onCreate={() => this.editWord(null)}
              onInherit={(word) => this.editWord(null, word)}
              onEdit={(word) => this.editWord(word)}
              onDelete={(word) => this.deleteWord(word.uid)}
              onMarkerToggled={(word, marker) => this.toggleWordMarker(word, marker)}
              onLinkClick={(name) => this.updateWordsByName(name)}
              onActivate={(activeWord) => this.setState({activeWord})}
              onPageSet={(page) => this.movePage({page})}
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
  searchResult: SearchResult,
  page: number,
  changed: boolean,
  alertOpen: boolean,
  progress: Progress
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});