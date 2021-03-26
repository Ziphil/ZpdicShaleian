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
  SplitLoader
} from "../../module/loader/split-loader";
import {
  Component
} from "../component";
import {
  Loading
} from "../compound/loading";


export class MainPage extends Component<Props, State> {

  public state: State = {
    dictionary: null,
    progress: 0
  }

  public componentDidMount(): void {
    let loader = new SplitLoader("C:/Users/Ziphil/Desktop/dic");
    loader.on("progress", (progress) => {
      this.setState({progress});
    })
    loader.on("end", (dictionary) => {
      this.setState({dictionary});
    })
    loader.on("error", (error) => {
      console.error(error);
    });
    loader.start();
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
          Dictionary loaded: {this.state.dictionary?.words?.length} words
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