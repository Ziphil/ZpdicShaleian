//

import {
  Menu,
  MenuDivider,
  MenuItem
} from "@blueprintjs/core";
import {
  ContextMenu2
} from "@blueprintjs/popover2";
import partial from "lodash-es/partial";
import * as react from "react";
import {
  FocusEvent,
  MouseEvent,
  ReactElement,
  ReactNode
} from "react";
import {
  Dictionary,
  Marker,
  Word
} from "../../module";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";

import {
  WordPane
} from "./word-pane";


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
        <MenuItem text={this.trans("wordPaneWrapper.cut")}/>
        <MenuItem text={this.trans("wordPaneWrapper.copy")}/>
        <MenuItem text={this.trans("wordPaneWrapper.paste")}/>
        <MenuDivider/>
        <MenuItem text={this.trans("wordPaneWrapper.toggleMarker")}>
          <MenuItem text={this.trans("common.marker.circle")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "circle")}/>
          <MenuItem text={this.trans("common.marker.square")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "square")}/>
          <MenuItem text={this.trans("common.marker.up")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "up")}/>
          <MenuItem text={this.trans("common.marker.diamond")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "diamond")}/>
          <MenuItem text={this.trans("common.marker.down")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "down")}/>
          <MenuItem text={this.trans("common.marker.cross")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "cross")}/>
          <MenuItem text={this.trans("common.marker.pentagon")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "pentagon")}/>
          <MenuItem text={this.trans("common.marker.heart")} onClick={this.props.onMarkerToggled && partial(this.props.onMarkerToggled, "heart")}/>
        </MenuItem>
      </Menu>
    );
    return node;
  }

  public render(): ReactNode {
    let menuNode = this.renderMenu();
    let className = "zp-word-pane-wrapper" + ((this.props.active) ? " zp-word-active" : "");
    let node = (
      <ContextMenu2 key={this.props.word.uid} content={menuNode}>
        <div className={className} tabIndex={0} onFocus={this.props.onActivate}>
          <WordPane
            dictionary={this.props.dictionary}
            word={this.props.word}
            language={this.props.language}
            onDoubleClick={this.props.onEdit}
            onLinkClick={this.props.onLinkClick}
          />
        </div>
      </ContextMenu2>
    );
    return node;
  }

}


type Props = {
  dictionary: Dictionary,
  word: Word,
  language: string,
  active: boolean,
  onCreate?: (event: MouseEvent<HTMLElement>) => void,
  onInherit?: (event: MouseEvent<HTMLElement>) => void,
  onEdit?: (event: MouseEvent<HTMLElement>) => void,
  onDelete?: (event: MouseEvent<HTMLElement>) => void,
  onActivate?: (event: FocusEvent<HTMLElement>) => void,
  onMarkerToggled?: (marker: Marker) => void,
  onLinkClick?: (name: string, event: MouseEvent<HTMLSpanElement>) => void
};
type State = {
};