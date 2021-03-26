//

import {
  BrowserWindowConstructorOptions,
  ipcRenderer
} from "electron";
import {
  Component as ReactComponent
} from "react";


export class Component<P, S, H = any> extends ReactComponent<{id?: string} & P, S, H> {

  public state!: S;

  protected createWindow(mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    let id = this.props.id!;
    ipcRenderer.send("create-window", mode, id, props, options);
  }

}
