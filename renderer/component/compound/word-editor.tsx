//

import {
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
    let originalUniqueName = props.word?.uniqueName ?? null;
    this.state = {uid, word, originalUniqueName};
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
      if (this.props.onConfirm) {
        this.props.onConfirm(this.state.uid, this.state.word, event);
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

  private setWord<T extends Array<unknown>>(setter: (...args: T) => void): (...args: T) => void {
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
          <InputGroup className="zpwde-name" inputRef={this.nameRef} fill={true} value={word.uniqueName} onChange={this.setWord((event) => word.uniqueName = event.target.value)}/>
          <NumericInput className="zpwde-date" value={word.date} minorStepSize={null} onValueChange={this.setWord((date) => word.date = Math.floor(date))}/>
        </div>
        <CodeMirror
          className="zpwde-content"
          value={word.contents[language] ?? ""}
          options={{theme: "zpshcontent", mode: {name: "shcontent"}, lineWrapping: true}}
          onBeforeChange={this.setWord((editor, data, value) => word.contents[language] = value)}
          editorDidMount={this.contentEditorDidMount.bind(this)}
        />
      </div>
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
    let node = (
      <div className="zpwde-editor zp-editor">
        <EditorHotKeys onConfirm={this.handleConfirm.bind(this)} onCancel={this.handleCancel.bind(this)}>
          <Tabs defaultSelectedTabId="ja" renderActiveTabPanelOnly={true}>
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
  onConfirm?: (uid: string | null, word: PlainWord, event?: MouseEvent<HTMLElement> | KeyboardEvent) => void,
  onCancel?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void
};
type State = {
  uid: string | null,
  word: PlainWord,
  originalUniqueName: string | null
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});