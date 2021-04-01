//

import {
  BrowserWindow
} from "electron";


export class BrowserWindowUtil {

  public static centerToParent(parent: BrowserWindow, child: BrowserWindow) {
    let parentBounds = parent.getBounds();
    let childBounds = child.getBounds();
    childBounds.x = (parentBounds.width - childBounds.width) / 2 + parentBounds.x;
    childBounds.y = (parentBounds.height - childBounds.height) / 2 + parentBounds.y;
    child.setBounds(childBounds);
  }

}