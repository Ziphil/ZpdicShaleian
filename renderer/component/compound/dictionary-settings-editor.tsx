//

import {
  Button,
  FormGroup,
  InputGroup,
  Tab,
  Tabs,
  TextArea,
  Toaster
} from "@blueprintjs/core";
import * as react from "react";
import {
  MouseEvent,
  ReactElement,
  ReactNode
} from "react";
import {
  PlainDictionary,
  PlainDictionarySettings,
  Revisions
} from "../../module";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class DictionarySettingsEditor extends Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    let rawSettings = props.dictionary.settings;
    let revisionString = Revisions.fromPlain(rawSettings.revisions).toString();
    let settings = {...rawSettings, revisionString};
    this.state = {settings};
  }

  private handleCancel(event: MouseEvent<HTMLElement>): void {
    if (this.props.onCancel) {
      this.props.onCancel(event);
    }
  }

  private handleConfirm(event: MouseEvent<HTMLElement>): void {
    if (this.props.onConfirm) {
      try {
        let settings = this.state.settings;
        settings.revisions = Revisions.fromString(settings.revisionString);
        this.props.onConfirm(settings, event);
      } catch (error) {
        CustomToaster.show({message: this.trans("dictionarySettingsEditor.errorRevisions"), icon: "error", intent: "danger"});
      }
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
      <div className="zp-dictionary-settings-editor-tab zp-editor-tab">
        <FormGroup label="バージョン" labelFor="version">
          <InputGroup id="version" value={settings.version} onChange={this.setSettings((event) => settings.version = event.target.value)}/>
        </FormGroup>
        <FormGroup label="アルファベット順" labelFor="alphabet-rule">
          <InputGroup id="alphabet-rule" value={settings.alphabetRule} onChange={this.setSettings((event) => settings.alphabetRule = event.target.value)}/>
        </FormGroup>
      </div>
    );
    return node;
  }

  public renderRevision(): ReactElement {
    let settings = this.state.settings;
    let node = (
      <div className="zp-dictionary-settings-editor-tab zp-editor-tab">
        <TextArea className="zp-dictionary-settings-editor-revision" fill={true} value={settings.revisionString} onChange={this.setSettings((event) => settings.revisionString = event.target.value)}/>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let basicNode = this.renderBasic();
    let revisionNode = this.renderRevision();
    let node = (
      <div className="zp-dictionary-settings-editor zp-editor">
        <Tabs defaultSelectedTabId="revision">
          <Tab id="basic" title={this.trans("dictionarySettingsEditor.basic")} panel={basicNode}/>
          <Tab id="revision" title={this.trans("dictionarySettingsEditor.revision")} panel={revisionNode}/>
        </Tabs>
        <div className="zp-dictionary-settings-editor-button zp-editor-button">
          <Button text={this.trans("dictionarySettingsEditor.cancel")} icon="cross" onClick={this.handleCancel.bind(this)}/>
          <Button text={this.trans("dictionarySettingsEditor.confirm")} intent="primary" icon="confirm" onClick={this.handleConfirm.bind(this)}/>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
  dictionary: PlainDictionary,
  onConfirm?: (settings: PlainDictionarySettings, event: MouseEvent<HTMLElement>) => void,
  onCancel?: (event: MouseEvent<HTMLElement>) => void
};
type State = {
  settings: PlainDictionarySettings & {revisionString: string};
};

let CustomToaster = Toaster.create({className: "zp-dictionary-settings-toaster", position: "top", maxToasts: 2});