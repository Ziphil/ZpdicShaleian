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
  PlainDictionarySettings,
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
    searchResult: {words: [], suggestions: [], elapsedTime: 0},
    page: 0,
    changed: false,
    alertOpen: false,
    loadProgress: {offset: 0, size: 0},
    saveProgress: {offset: 0, size: 0}
  };

  public constructor(props: Props) {
    super(props);
    this.setupIpc();
    this.setupEventListener();
  }

  public async componentDidMount(): Promise<void> {
    let settings = await window.api.sendAsync("get-settings");
    let path = settings.defaultDictionaryPath;
    if (path !== undefined) {
      this.loadDictionary(path);
    }
  }

  private async setupEventListener(): Promise<void> {
    let packaged = await this.getPackaged();
    if (packaged) {
      window.addEventListener("beforeunload", (event) => {
        this.requestCloseWindow();
        event.returnValue = false;
      });
    }
  }

  private async startLoadDictionary(): Promise<void> {
    let confirmed = await this.checkLeave();
    if (confirmed) {
      let result = await window.api.sendAsync("show-open-dialog", {properties: ["openDirectory"]});
      if (!result.canceled) {
        let path = result.filePaths[0];
        this.loadDictionary(path);
      }
    }
  }

  private async loadDictionary(path: string): Promise<void> {
    let dictionary = null;
    let loadProgress = {offset: 0, size: 0};
    this.setState({dictionary, loadProgress, activeWord: null, changed: false});
    try {
      let plainDictionary = await window.api.sendAsync("load-dictionary", path);
      let dictionary = Dictionary.fromPlain(plainDictionary);
      window.api.sendAsync("change-settings", "defaultDictionaryPath", path);
      this.setState({dictionary}, () => {
        this.updateWords();
      });
    } catch (error) {
      CustomToaster.show({message: this.trans("mainPage.failLoadDictionary"), icon: "error", intent: "danger"});
    }
  }

  private async reloadDictionary(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null && dictionary.path !== null) {
      let confirmed = await this.checkLeave();
      if (confirmed) {
        let path = dictionary.path;
        await this.loadDictionary(path);
      }
    }
  }

  @on("get-load-dictionary-progress")
  private updateLoadDictionaryProgress(progress: Progress): void {
    this.setState({loadProgress: progress});
  }

  private async saveDictionary(path: string | null): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      try {
        await window.api.sendAsync("save-dictionary", dictionary.toPlain(), path);
        this.setState({changed: false});
        CustomToaster.show({message: this.trans("mainPage.succeedSaveDictionary"), icon: "tick", intent: "success"}, "saveDictionary");
      } catch (error) {
        CustomToaster.show({message: this.trans("mainPage.failLoadDictionary"), icon: "error", intent: "danger"}, "saveDictionary");
      }
    }
  }

  @on("get-save-dictionary-progress")
  private updateSaveDictionaryProgress(progress: Progress): void {
    let message = <EnhancedProgressBar className="zpmnp-save-progress-bar" progress={progress} showDetail={false}/>;
    CustomToaster.show({message, icon: "floppy-disk", timeout: 0}, "saveDictionary");
  }

  private async startExportDictionary(type: string): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let result = await window.api.sendAsync("show-save-dialog", {});
      if (!result.canceled) {
        let path = result.filePath;
        await this.exportDictionary(path, type);
      }
    }
  }

  private async exportDictionary(path: string, type: string): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      try {
        await window.api.sendAsync("export-dictionary", dictionary.toPlain(), path, type);
        CustomToaster.show({message: this.trans("mainPage.succeedExportDictionary"), icon: "tick", intent: "success"}, "exportDictionary");
      } catch (error) {
        CustomToaster.show({message: this.trans("mainPage.failExportDictionary"), icon: "tick", intent: "danger"}, "exportDictionary");
      }
    }
  }

  @on("get-export-dictionary-progress")
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
      let searchResult = {...this.state.searchResult};
      this.setState({searchResult});
    } else {
      let searchResult = dictionary.search(this.state.parameter);
      this.setState({searchResult});
    }
  }

  // 検索結果の単語リストをシャッフルします。
  // 検索結果ペインのスクロール位置はリセットされます。
  private shuffleWords(): void {
    let oldWords = this.state.searchResult.words;
    let words = [...ArrayUtil.shuffle(oldWords)];
    let searchResult = {...this.state.searchResult, words};
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
    let maxPage = Math.max(Math.ceil(this.state.searchResult.words.length / 30) - 1, 0);
    let page = (() => {
      if (spec === "first") {
        return 0;
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

  private startEditWord(word: PlainWord | null, defaultWord?: PlainWord): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
      this.createWindow("editor", {word, defaultWord}, options);
    }
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

  @on("edit-word")
  private editWord(uid: string | null, word: PlainWord): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.editWord(uid, word);
      this.setState({changed: true});
      this.refreshWords(true);
    }
  }

  @onAsync("do-validate-edit-word")
  private async validateEditWord(uid: string | null, word: PlainWord): Promise<string | null> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      return dictionary.validateEditWord(uid, word);
    } else {
      return "";
    }
  }

  @on("delete-word")
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

  private toggleWordMarker(word: Word, marker: Marker): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.toggleMarker(word.uniqueName, marker);
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

  private startChangeDictionarySettings(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let options = {width: 640, height: 480, minWidth: 480, minHeight: 320, type: "toolbar"};
      let settings = dictionary.settings;
      this.createWindow("dictionary-settings", {settings}, options);
    }
  }

  @on("change-dictionary-settings")
  private changeDictionarySettings(settings: PlainDictionarySettings): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      dictionary.changeSettings(settings);
      this.setState({changed: true});
    }
  }

  private startExecGitCommit(): void {
    let dictionary = this.state.dictionary;
    if (dictionary !== null && dictionary.path !== null) {
      let options = {width: 480, height: 320, minWidth: 320, minHeight: 240, type: "toolbar"};
      let path = dictionary.path;
      this.createWindow("git-commit", {path}, options);
    }
  }

  @on("succeed-exec-git-commit")
  private succeedExecGitCommit(): void {
    CustomToaster.show({message: this.trans("mainPage.succeedExecGitCommit"), icon: "tick", intent: "success"});
  }

  @on("fail-exec-git-commit")
  private failExecGitCommit(): void {
    CustomToaster.show({message: this.trans("mainPage.failExecGitCommit"), icon: "error", intent: "danger"});
  }

  private async execGitPush(): Promise<void> {
    let dictionary = this.state.dictionary;
    if (dictionary !== null) {
      let path = dictionary.path;
      try {
        await window.api.sendAsync("exec-git-push", path);
        CustomToaster.show({message: this.trans("mainPage.succeedExecGitPush"), icon: "tick", intent: "success"});
      } catch (error) {
        CustomToaster.show({message: this.trans("mainPage.failExecGitPush"), icon: "error", intent: "danger"});
      }
    }
  }

  private async requestCloseWindow(): Promise<void> {
    let confirmed = await this.checkLeave();
    if (confirmed) {
      this.destroyWindow();
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
        loadDictionary={() => this.startLoadDictionary()}
        reloadDictionary={() => this.reloadDictionary()}
        saveDictionary={() => this.saveDictionary(null)}
        exportDictionary={(type) => this.startExportDictionary(type)}
        closeWindow={() => this.closeWindow()}
        changeWordMode={(mode) => this.changeWordMode(mode, true)}
        changeWordType={(type) => this.changeWordType(type, true)}
        changeLanguage={(language) => this.changeLanguage(language, true)}
        shuffleWords={() => this.shuffleWords()}
        moveFirstPage={() => this.movePage("first")}
        movePreviousPage={() => this.movePage({difference: -1})}
        moveNextPage={() => this.movePage({difference: 1})}
        moveLastPage={() => this.movePage("last")}
        createWord={() => this.startEditWord(null)}
        inheritActiveWord={() => this.startEditActiveWord(null, "active")}
        editActiveWord={() => this.startEditActiveWord("active")}
        deleteActiveWord={() => this.deleteActiveWord()}
        toggleActiveWordMarker={(marker) => this.toggleActiveWordMarker(marker)}
        execGitCommit={() => this.startExecGitCommit()}
        execGitPush={() => this.execGitPush()}
        openDictionarySettings={() => this.startChangeDictionarySettings()}
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
        <Loading loading={this.state.dictionary === null} progress={this.state.loadProgress}>
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
              onCreate={() => this.startEditWord(null)}
              onInherit={(word) => this.startEditWord(null, word)}
              onEdit={(word) => this.startEditWord(word)}
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
  loadProgress: Progress,
  saveProgress: Progress
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});