//

import {
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Dictionary
} from "../../module";
import {
  Component
} from "../component";
import {
  Loading,
  WordList
} from "../compound";


export class MainPage extends Component<Props, State> {

  public state: State = {
    dictionary: null,
    progress: 0
  }

  public componentDidMount(): void {
    this.loadDictionary();
  }

  private loadDictionary(): void {
    window.api.send("ready-get-dictionary", "C:/Users/Ziphil/Desktop/dic");
    window.api.on("get-dictionary-progress", (event, progress) => {
      this.setState({progress});
    });
    window.api.on("get-dictionary", (event, plainDictionary) => {
      let dictionary = Dictionary.fromPlain(plainDictionary);
      this.setState({dictionary});
    });
  }

  private renderNavbar(): ReactNode {
    let node = (
      <Navbar fixedToTop={true}>
        <NavbarGroup align="left">
          <NavbarHeading>
            <strong>シャレイア語辞典</strong>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="left">
          <Button text="ファイル" minimal={true}/>
          <Button text="検索" minimal={true}/>
          <Button text="編集" minimal={true}/>
        </NavbarGroup>
      </Navbar>
    );
    return node;
  }

  public render(): ReactNode {
    let navbarNode = this.renderNavbar();
    let node = (
      <div className="zp-root zp-navbar-root">
        {navbarNode}
        <Loading loading={this.state.dictionary === null} progress={this.state.progress}>
          <div className="zp-searcher-container">
            Search form here
          </div>
          <div className="zp-word-list-container">
            <WordList words={this.state.dictionary?.words!} language="ja"/>
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
  progress: number
};