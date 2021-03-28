//

import {
  FocusStyleManager
} from "@blueprintjs/core";
import * as react from "react";
import {
  render
} from "react-dom";
import {
  configure as configureHotkeys
} from "react-hotkeys";
import {
  Root
} from "./component/root";


class Main {

  public main(): void {
    this.setupBlueprint();
    this.setupHotkeys();
    this.render();
  }

  private setupBlueprint(): void {
    FocusStyleManager.onlyShowFocusOnTabs();
  }

  private setupHotkeys(): void {
    configureHotkeys({ignoreTags: ["select"]});
  }

  private render(): void { 
    require("./component/root.scss");
    render(<Root/>, document.getElementById("root"));
  }

}


let main = new Main();
main.main();