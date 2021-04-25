//

import {
  Button,
  FormGroup,
  InputGroup,
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
  ReactNode
} from "react";
import {
  Controlled as CodeMirror
} from "react-codemirror2";
import {
  Deserializer,
  PlainDictionarySettings,
  Serializer
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
export class DictionarySettingsEditor extends Component<Props, State> {

  public state: State = {
    settings: undefined as any
  };

  public constructor(props: Props) {
    super(props);
    let serializer = new Serializer();
    let oldSettings = props.settings;
    let revisionString = serializer.serializeRevisions(oldSettings.revisions, {part: true});
    let settings = {...oldSettings, revisionString};
    this.state = {settings};
  }

  private contentEditorDidMount(editor: Editor): void {
    editor.focus();
    editor.scrollTo(0, 10000);
  }

  private handleCancel(event: MouseEvent<HTMLElement> | KeyboardEvent): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private handleConfirm(event?: MouseEvent<HTMLElement> | KeyboardEvent): void {
    try {
      let deserializer = new Deserializer();
      let settings = this.state.settings;
      settings.revisions = deserializer.deserializeRevisions(settings.revisionString, {part: true});
      if (this.props.onConfirm) {
        this.props.onConfirm(settings, event);
      }
    } catch (error) {
      CustomToaster.show({message: this.trans("dictionarySettingsEditor.failDeserializeRevisions"), icon: "error", intent: "danger"});
    }
  }

  private setSettings<T extends Array<unknown>>(setter: (...args: T) => void): (...args: T) => void {
    let outerThis = this;
    let wrapper = function (...args: T): void {
      setter(...args);
      let settings = outerThis.state.settings;
      outerThis.setState({settings});
    };
    return wrapper;
  }

  public renderBasic(): ReactElement {
    let settings = this.state.settings;
    let node = (
      <div className="zpdse-editor-tab zp-editor-tab">
        <FormGroup label={this.trans("dictionarySettingsEditor.version")} labelFor="version">
          <InputGroup id="version" value={settings.version} onChange={this.setSettings((event) => settings.version = event.target.value)}/>
        </FormGroup>
        <FormGroup label={this.trans("dictionarySettingsEditor.alphabetRule")} labelFor="alphabet-rule">
          <InputGroup id="alphabet-rule" value={settings.alphabetRule} onChange={this.setSettings((event) => settings.alphabetRule = event.target.value)}/>
        </FormGroup>
      </div>
    );
    return node;
  }

  public renderRevision(): ReactElement {
    let settings = this.state.settings;
    let node = (
      <div className="zpdse-editor-tab zp-editor-tab">
        <CodeMirror
          className="zpdse-revision"
          value={settings.revisionString}
          options={{theme: "zpshcontent", mode: {name: "shrevision"}, lineWrapping: true}}
          onBeforeChange={this.setSettings((editor, data, value) => settings.revisionString = value)}
          editorDidMount={this.contentEditorDidMount.bind(this)}
        />
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let basicNode = this.renderBasic();
    let revisionNode = this.renderRevision();
    let node = (
      <div className="zpdse-editor zp-editor">
        <EditorHotKeys onConfirm={this.handleConfirm.bind(this)} onCancel={this.handleCancel.bind(this)}>
          <Tabs defaultSelectedTabId="revision">
            <Tab id="basic" title={this.trans("dictionarySettingsEditor.basic")} panel={basicNode}/>
            <Tab id="revision" title={this.trans("dictionarySettingsEditor.revision")} panel={revisionNode}/>
          </Tabs>
          <div className="zpdse-editor-button zp-editor-button">
            <Button text={this.trans("common.cancel")} onClick={this.handleCancel.bind(this)}/>
            <Button text={this.trans("common.confirm")} intent="primary" onClick={this.handleConfirm.bind(this)}/>
          </div>
        </EditorHotKeys>
      </div>
    );
    return node;
  }

}


type Props = {
  settings: PlainDictionarySettings,
  onConfirm?: (settings: PlainDictionarySettings, event?: MouseEvent<HTMLElement> | KeyboardEvent) => void,
  onCancel?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void
};
type State = {
  settings: PlainDictionarySettings & {revisionString: string}
};

let CustomToaster = Toaster.create({position: "top", maxToasts: 2});