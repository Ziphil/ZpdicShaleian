//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  PlainDictionarySettings
} from "../../module/dictionary";
import {
  Component
} from "../component";
import {
  DictionarySettingsEditor
} from "../compound";
import {
  component
} from "../decorator";


@component()
export class DictionarySettingsPage extends Component<Props, State> {

  private changeDictionarySettings(settings: PlainDictionarySettings): void {
    window.api.send("ready-change-dictionary-settings", settings);
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpdsp-root zp-root">
        <DictionarySettingsEditor
          settings={this.props.settings}
          onConfirm={this.changeDictionarySettings.bind(this)}
          onCancel={this.closeWindow.bind(this)}
        />
      </div>
    );
    return node;
  }

}


type Props = {
  settings: PlainDictionarySettings
};
type State = {
};