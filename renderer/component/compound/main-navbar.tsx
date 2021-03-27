//

import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  NavbarGroup,
  NavbarHeading
} from "@blueprintjs/core";
import {
  Popover2
} from "@blueprintjs/popover2";
import * as react from "react";
import {
  ReactElement,
  ReactNode
} from "react";
import {
  GlobalHotKeys
} from "react-hotkeys";
import {
  WordMode,
  WordType
} from "../../module";
import {
  Component
} from "../component";


export class MainNavbar extends Component<Props, State> {

  private renderFileMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem text="開く" label="Ctrl+O" icon="document-open"/>
        <MenuItem text="再読み込み" label="Ctrl+Shift+O" icon="blank"/>
        <MenuDivider/>
        <MenuItem text="上書き保存" label="Ctrl+S" icon="floppy-disk"/>
        <MenuItem text="別形式で保存" icon="blank">
          <MenuItem text="旧シャレイア語辞典形式"/>
          <MenuItem text="OTM-JSON 形式"/>
        </MenuItem>
        <MenuDivider/>
        <MenuItem text="終了" icon="cross"/>
      </Menu>
    );
    return node;
  }

  private renderSearchMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem text="検索範囲の変更" icon="blank">
          <MenuItem text="単語" label="Ctrl+W" onClick={() => this.props.changeWordMode("name")}/>
          <MenuItem text="訳語" label="Ctrl+E" onClick={() => this.props.changeWordMode("equivalent")}/>
          <MenuItem text="両方" label="Ctrl+Shift+W" onClick={() => this.props.changeWordMode("both")}/>
          <MenuItem text="内容" label="Ctrl+Q" onClick={() => this.props.changeWordMode("content")}/>
        </MenuItem>
        <MenuItem text="検索方式の変更" icon="blank">
          <MenuItem text="完全一致" label="Ctrl+Shift+T" onClick={() => this.props.changeWordType("exact")}/>
          <MenuItem text="前方一致" label="Ctrl+T" onClick={() => this.props.changeWordType("prefix")}/>
          <MenuItem text="後方一致" onClick={() => this.props.changeWordType("suffix")}/>
          <MenuItem text="部分一致" onClick={() => this.props.changeWordType("part")}/>
          <MenuItem text="最小対語" label="Ctrl+Shift+G" onClick={() => this.props.changeWordType("pair")}/>
          <MenuItem text="正規表現" label="Ctrl+G" onClick={() => this.props.changeWordType("regular")}/>
        </MenuItem>
        <MenuItem text="検索結果のシャッフル" icon="random" label="Ctrl+R"/>
        <MenuDivider/>
        <MenuItem text="高度な検索" icon="blank" label="Ctrl+F"/>
        <MenuItem text="スクリプト検索" icon="blank" label="Ctrl+Shift+F"/>
      </Menu>
    );
    return node;
  }

  private renderHelpMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem text="デベロッパーツールを開く" icon="blank" label="F12"/>
        <MenuDivider/>
        <MenuItem text="ヘルプ" icon="help" label="F1"/>
        <MenuItem text="このアプリについて" icon="blank"/>
      </Menu>
    );
    return node;
  }

  private renderHotkeys(): ReactNode {
    let keyMap = {
      changeWordModeToName: "ctrl+w",
      changeWordModeToEquivalent: "ctrl+e"
    };
    let handlers = {
      changeWordModeToName: () => this.props.changeWordMode("name"),
      changeWordModeToEquivalent: () => this.props.changeWordMode("equivalent")
    };
    let node = <GlobalHotKeys keyMap={keyMap} handlers={handlers}/>;
    return node;
  }

  public render(): ReactNode {
    let hotkeyNode = this.renderHotkeys();
    let node = (
      <Navbar fixedToTop={true}>
        <NavbarGroup align="left">
          <NavbarHeading>
            <strong>シャレイア語辞典</strong>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="left">
          <Popover2 content={this.renderFileMenu()} position="bottom-left">
            <Button text="ファイル" minimal={true}/>
          </Popover2>
          <Popover2 content={this.renderSearchMenu()} position="bottom-left">
            <Button text="検索" minimal={true}/>
          </Popover2>
          <Button text="編集" minimal={true}/>
          <Button text="Git" minimal={true}/>
          <Button text="設定" minimal={true}/>
          <Popover2 content={this.renderHelpMenu()} position="bottom-left">
            <Button text="ヘルプ" minimal={true}/>
          </Popover2>
        </NavbarGroup>
      </Navbar>
    );
    return [node, hotkeyNode];
  }

}


type Props = {
  changeWordMode: (mode: WordMode) => void;
  changeWordType: (type: WordType) => void;
};
type State = {
};