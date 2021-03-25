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
  Component
} from "../component";


export class MainPage extends Component<Props, State> {

  public async componentDidMount(): Promise<void> {
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
        Hello, React!
        This is a main page.
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
};