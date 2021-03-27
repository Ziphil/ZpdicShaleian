//

import {
  FocusStyleManager
} from "@blueprintjs/core";
import * as react from "react";
import {
  render
} from "react-dom";
import {
  Root
} from "./component/root";


class Main {

  public main(): void {
    this.render();
  }

  private render(): void { 
    FocusStyleManager.onlyShowFocusOnTabs();
    require("./component/root.scss");
    render(<Root/>, document.getElementById("root"));
  }

}


let main = new Main();
main.main();