//

import {
  Alert,
  Button,
  IRefObject,
  InputGroup,
  NumericInput,
  Tab,
  Tabs,
  Toaster
} from "@blueprintjs/core";
import {
  Editor
} from "codemirror";
import * as react from "react";
import {
  MouseEvent,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  createRef
} from "react";
import {
  Controlled as CodeMirror
} from "react-codemirror2";
import {
  PlainWord,
  Word
} from "soxsot";
import {
  EditorHotKeys
} from "../atom";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class WordEditor extends Component<Props, State> {

  private nameRef: IRefObject<HTMLInputElement> = createRef();

  public constructor(props: Props) {
    super(props);
    let uid = props.word?.uid ?? null;
    let word = (props.defaultWord !== undefined) ? props.defaultWord : (props.word !== null) ? props.word : Word.createEmpty();
    let oldWord = {...word, contents: {...word.contents}};
    let originalUniqueName = props.word?.uniqueName ?? null;
    let alertOpen = false;
    this.state = {uid, word, oldWord, originalUniqueName, alertOpen};
  }

  private contentEditorDidMount(editor: Editor): void {
    editor.focus();
  }

  private handleCancel(event: MouseEvent<HTMLElement> | KeyboardEvent): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private async handleConfirm(event?: MouseEvent<HTMLElement> | KeyboardEvent): Promise<void> {
    let errorType = await this.sendAsync("validateEditWord", this.state.uid, this.state.word);
    if (errorType === null) {
      if (this.checkChange()) {
        this.forceClose(event);
      } else {
        this.setState({alertOpen: true});
      }
    } else {
      if (errorType === "invalidUniqueName") {
        CustomToaster.show({message: this.trans("wordEditor.invalidUniqueName"), icon: "error", intent: "danger"});
      } else if (errorType === "duplicateUniqueName") {
        CustomToaster.show({message: this.trans("wordEditor.duplicateUniqueName"), icon: "error", intent: "danger"});
      } else {
        CustomToaster.show({message: this.trans("wordEditor.failValidate"), icon: "error", intent: "danger"});
      }
    }
  }

  private forceClose(event?: SyntheticEvent<HTMLElement> | KeyboardEvent) {
    if (this.props.onConfirm) {
      this.props.onConfirm(this.state.uid, this.state.word, event);
    }
  }

  /** 全ての言語に対するデータが更新されているかどうかを調べます。
   * 1 つの言語のデータに変更が行われているのに他の言語のデータには変更が行われていない場合に、`false` を返します。
   * 全ての言語のデータが全く変更されていない場合と、全ての言語のデータに何らかの変更が行われている場合は、`true` を返します。
   * ただし、もともとデータが空だった言語についてはチェックしません。*/
  private checkChange(): boolean {
    let languages = ["ja", "en"];
    let oldContents = this.state.oldWord.contents;
    let newContents = this.state.word.contents;
    if (languages.every((language) => (oldContents[language] ?? "") === (newContents[language] ?? ""))) {
      return true;
    } else if (languages.every((language) => (oldContents[language] ?? "") === "" || (oldContents[language] ?? "") !== (newContents[language] ?? ""))) {
      return true;
    } else {
      return false;
    }
  }

  private setWord<T extends Array<unknown>>(language: string, setter: (...args: T) => void): (...args: T) => void {
    let outerThis = this;
    let wrapper = function (...args: T): void {
      setter(...args);
      let word = outerThis.state.word;
      outerThis.setState({word});
    };
    return wrapper;
  }

  public renderEditor(language: string): ReactElement {
    let word = this.state.word;
    let node = (
      <div className="zpwde-editor-tab zp-editor-tab" key={language}>
        <div className="zpwde-head">
          <InputGroup className="zpwde-name" inputRef={this.nameRef} fill={true} value={word.uniqueName} onChange={this.setWord(language, (event) => word.uniqueName = event.target.value)}/>
          <NumericInput className="zpwde-date" value={word.date} minorStepSize={null} onValueChange={this.setWord(language, (date) => word.date = Math.floor(date))}/>
        </div>
        <CodeMirror
          className="zpwde-content"
          value={word.contents[language] ?? ""}
          options={{theme: "zpshcontent", mode: {name: "shcontent"}, lineWrapping: true}}
          onBeforeChange={this.setWord(language, (editor, data, value) => word.contents[language] = value)}
          editorDidMount={this.contentEditorDidMount.bind(this)}
        />
      </div>
    );
    return node;
  }

  private renderAlert(): ReactNode {
    let node = (
      <Alert
        isOpen={this.state.alertOpen}
        cancelButtonText={this.trans("wordEditor.alertCancel")}
        confirmButtonText={this.trans("wordEditor.alertConfirm")}
        icon="warning-sign"
        intent="danger"
        canEscapeKeyCancel={true}
        canOutsideClickCancel={true}
        onCancel={() => this.setState({alertOpen: false})}
        onConfirm={(event) => this.forceClose(event)}
      >
        <p>{this.trans("wordEditor.alert")}</p>
      </Alert>
    );
    return node;
  }

  public render(): ReactNode {
    let languages = ["ja", "en"];
    let tabNodes = languages.map((language) => {
      let editorNode = this.renderEditor(language);
      let tabNode = (
        <Tab id={language} key={language} title={this.trans(`common.language.${language}`)} panel={editorNode}/>
      );
      return tabNode;
    });
    let alertNode = this.renderAlert();
    let node = (
      <div className="zpwde-editor zp-editor">
        {alertNode}
        <EditorHotKeys onConfirm={this.handleConfirm.bind(this)} onCancel={this.handleCancel.bind(this)}>
          <Tabs defaultSelectedTabId={this.props.language} renderActiveTabPanelOnly={true}>
            {tabNodes}
          </Tabs>
          <div className="zpwde-editor-button zp-editor-button">
            <Button text={this.trans("wordEditor.cancel")} onClick={this.handleCancel.bind(this)}/>
            <Button text={this.trans("wordEditor.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
          </div>
        </EditorHotKeys>
      </div>
    );
    return node;
  }

}


type Props = {
  word: PlainWord | null,
  defaultWord?: PlainWord,
  language: string,
  onConfirm?: (uid: string | null, word: PlainWord, event?: SyntheticEvent<HTMLElement> | KeyboardEvent) => void,
  onCancel?: (event: SyntheticEvent<HTMLElement> | KeyboardEvent) => void
};
type State = {
  uid: string | null,
  word: PlainWord,
  oldWord: PlainWord,
  originalUniqueName: string | null,
  alertOpen: boolean
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});