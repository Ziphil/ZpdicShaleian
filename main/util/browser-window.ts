//

import {
  BrowserWindow
} from "electron";


export class BrowserWindowUtil {

  public static centerToParent(parent: BrowserWindow, child: BrowserWindow) {
    let parentBounds = parent.getBounds();
    let childBounds = child.getBounds();
    let x = Math.floor((parentBounds.width - childBounds.width) / 2 + parentBounds.x);
    let y = Math.floor((parentBounds.height - childBounds.height) / 2 + parentBounds.y);
    let width = Math.floor(childBounds.width);
    let height = Math.floor(childBounds.height);
    child.setBounds({x, y, width, height});
  }

}