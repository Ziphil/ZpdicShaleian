//

import {
  BrowserWindow
} from "electron";


export class BrowserWindowUtil {

  public static centerToParent(parent: BrowserWindow, child: BrowserWindow): void {
    const parentBounds = parent.getBounds();
    const childBounds = child.getBounds();
    const x = Math.floor((parentBounds.width - childBounds.width) / 2 + parentBounds.x);
    const y = Math.floor((parentBounds.height - childBounds.height) / 2 + parentBounds.y);
    const width = Math.floor(childBounds.width);
    const height = Math.floor(childBounds.height);
    child.setBounds({x, y, width, height});
  }

}