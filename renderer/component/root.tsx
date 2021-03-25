//

import {
  ipcRenderer
} from "electron";
import * as queryParser from "query-string";
import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  MainPage
} from "./page/main-page";


export class Root extends Component<Props, State> {

  public state: State = {
    mode: "",
    id: "",
    props: null
  };

  public async componentDidMount(): Promise<void> {
    let query = queryParser.parse(window.location.search);
    let mode = query.mode;
    let id = query.id;
    if (typeof mode === "string" && typeof id === "string") {
      ipcRenderer.send("ready-get-props", id);
      ipcRenderer.on("get-props", (event, props) => {
        this.setState({props}, () => {
          ipcRenderer.send("ready-show", id);
        });
      });
      this.setState({mode, id});
    }
  }

  public render(): ReactNode {
    let props = this.state.props;
    let id = this.state.id;
    if (this.state.props !== null) {
      if (this.state.mode === "main") {
        return <MainPage id={id} {...props}/>;
      } else {
        return <div/>;
      }
    } else {
      return <div/>;
    }
  }

}


type Props = {
};
type State = {
  mode: string,
  id: string,
  props: any | null
};