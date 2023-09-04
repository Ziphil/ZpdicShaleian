//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  PlainDictionarySettings
} from "soxsot";
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

  private handleConfirm(settings: PlainDictionarySettings): void {
    this.closeWindow(settings);
  }

  private handleCancel(): void {
    this.closeWindow();
  }

  public render(): ReactNode {
    const node = (
      <div className="zpdsp-root zp-root">
        <DictionarySettingsEditor
          settings={this.props.settings}
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
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