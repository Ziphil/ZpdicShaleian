//

import {
  Menu,
  MenuDivider,
  MenuItem
} from "@blueprintjs/core";
import {
  ContextMenu2
} from "@blueprintjs/popover2";
import * as react from "react";
import {
  MouseEvent,
  ReactElement,
  ReactNode
} from "react";
import {
  HotKeys
} from "react-hotkeys"
import {
  Component
} from "../component";
import {
  WordPane
} from "./word-pane";
import {
  component
} from "../decorator";
import {
  Word
} from "../../module";


@component()
export class WordPaneWrapper extends Component<Props, State> {

  public renderMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem text={this.trans("wordPaneWrapper.create")} onClick={this.props.onCreate}/>
        <MenuItem text={this.trans("wordPaneWrapper.inherit")} onClick={this.props.onInherit}/>
        <MenuItem text={this.trans("wordPaneWrapper.edit")} onClick={this.props.onEdit}/>
        <MenuItem text={this.trans("wordPaneWrapper.delete")} intent="danger" onClick={this.props.onDelete}/>
        <MenuDivider/>
        <MenuItem text={this.trans("wordPaneWrapper.addMarker")}>
          <MenuItem text={this.trans("wordPaneWrapper.marker.circle")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.square")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.upTriangle")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.diamond")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.downTriangle")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.cross")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.pentagon")}/>
          <MenuItem text={this.trans("wordPaneWrapper.marker.heart")}/>
        </MenuItem>
      </Menu>
    );
    return node;
  }

  public render(): ReactNode {
    let menuNode = this.renderMenu();
    let node = (
      <ContextMenu2 content={menuNode}>
        <HotKeys className="zp-word-pane-wrapper" id={this.props.word.uid} tabIndex={0}>
          <WordPane
            word={this.props.word}
            language={this.props.language}
            onDoubleClick={this.props.onEdit}
            onLinkClick={this.props.onLinkClick}
          />
        </HotKeys>
      </ContextMenu2>
    );
    return node;
  }

}


type Props = {
  word: Word,
  language: string,
  onCreate?: (event: MouseEvent<HTMLElement>) => void,
  onInherit?: (event: MouseEvent<HTMLElement>) => void,
  onEdit?: (event: MouseEvent<HTMLElement>) => void,
  onDelete?: (event: MouseEvent<HTMLElement>) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};