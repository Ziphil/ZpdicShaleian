//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "../component";
import {
  UploadDictionaryChooser
} from "../compound/upload-dictionary-chooser";
import {
  component
} from "../decorator";


@component()
export class UploadDictionaryPage extends Component<Props, State> {

  private handleConfirm(url: string, password: string): void {
    this.closeWindow({url, password});
  }

  private handleCancel(): void {
    this.closeWindow();
  }

  public render(): ReactNode {
    let node = (
      <div className="zpgpp-root zp-root">
        <UploadDictionaryChooser
          onConfirm={this.handleConfirm.bind(this)}
          onCancel={this.handleCancel.bind(this)}
        />
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
};