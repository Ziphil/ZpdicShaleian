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
  Fragment,
  ReactElement,
  ReactNode
} from "react";
import {
  GlobalHotKeys
} from "react-hotkeys";
import {
  component
} from "../decorator";
import {
  WordMode,
  WordType
} from "../../module";
import {
  HairianUtil
} from "../../util/hairian";
import {
  HandlerManager
} from "../../util/handler-manager";
import {
  Component
} from "../component";


@component()
export class MainNavbar extends Component<Props, State> {

  private handlerManager: HandlerManager;

  public constructor(props: Props) {
    super(props);
    this.handlerManager = this.createHandlerManager();
  }

  private renderFileMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem
          text={this.trans("mainNavbar.openDictionary")}
          label={this.handlerManager.getLabel("openDictionary")}
          onClick={this.handlerManager.getHandler("openDictionary")}
          icon="document-open"
        />
        <MenuItem
          text={this.trans("mainNavbar.reopenDictionary")}
          label={this.handlerManager.getLabel("reopenDictionary")}
          onClick={this.handlerManager.getHandler("reopenDictionary")}
          icon="blank"
        />
        <MenuDivider/>
        <MenuItem
          text={this.trans("mainNavbar.saveDictionary")}
          label={this.handlerManager.getLabel("saveDictionary")}
          onClick={this.handlerManager.getHandler("saveDictionary")}
          icon="floppy-disk"
        />
        <MenuItem text={this.trans("mainNavbar.exportDictionary")} icon="blank">
          <MenuItem
            text={this.trans("mainNavbar.exportDictionaryAsOldShaleian")}
            label={this.handlerManager.getLabel("exportDictionaryAsOldShaleian")}
            onClick={this.handlerManager.getHandler("exportDictionaryAsOldShaleian")}
          />
          <MenuItem
            text={this.trans("mainNavbar.exportDictionaryAsSlime")}
            label={this.handlerManager.getLabel("exportDictionaryAsSlime")}
            onClick={this.handlerManager.getHandler("exportDictionaryAsSlime")}
          />
        </MenuItem>
        <MenuDivider/>
        <MenuItem
          text={this.trans("mainNavbar.quit")}
          label={this.handlerManager.getLabel("quit")}
          onClick={this.handlerManager.getHandler("quit")}
          icon="cross"
        />
      </Menu>
    );
    return node;
  }

  private renderSearchMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem text={this.trans("mainNavbar.changeWordMode")} icon="blank">
          <MenuItem
            text={this.trans("searchForm.mode.name")}
            label={this.handlerManager.getLabel("changeWordModeToName")}
            onClick={this.handlerManager.getHandler("changeWordModeToName")}
          />
          <MenuItem
            text={this.trans("searchForm.mode.equivalent")}
            label={this.handlerManager.getLabel("changeWordModeToEquivalent")}
            onClick={this.handlerManager.getHandler("changeWordModeToEquivalent")}
          />
          <MenuItem
            text={this.trans("searchForm.mode.both")}
            label={this.handlerManager.getLabel("changeWordModeToBoth")}
            onClick={this.handlerManager.getHandler("changeWordModeToBoth")}
          />
          <MenuItem
            text={this.trans("searchForm.mode.content")}
            label={this.handlerManager.getLabel("changeWordModeToContent")}
            onClick={this.handlerManager.getHandler("changeWordModeToContent")}
          />
        </MenuItem>
        <MenuItem text={this.trans("mainNavbar.changeWordType")} icon="blank">
          <MenuItem
            text={this.trans("searchForm.type.exact")}
            label={this.handlerManager.getLabel("changeWordTypeToExact")}
            onClick={this.handlerManager.getHandler("changeWordTypeToExact")}
          />
          <MenuItem
            text={this.trans("searchForm.type.prefix")}
            label={this.handlerManager.getLabel("changeWordTypeToPrefix")}
            onClick={this.handlerManager.getHandler("changeWordTypeToPrefix")}
          />
          <MenuItem
            text={this.trans("searchForm.type.suffix")}
            label={this.handlerManager.getLabel("changeWordTypeToSuffix")}
            onClick={this.handlerManager.getHandler("changeWordTypeToSuffix")}
          />
          <MenuItem
            text={this.trans("searchForm.type.part")}
            label={this.handlerManager.getLabel("changeWordTypeToPart")}
            onClick={this.handlerManager.getHandler("changeWordTypeToPart")}
          />
          <MenuItem
            text={this.trans("searchForm.type.pair")}
            label={this.handlerManager.getLabel("changeWordTypeToPair")}
            onClick={this.handlerManager.getHandler("changeWordTypeToPair")}
          />
          <MenuItem
            text={this.trans("searchForm.type.regular")}
            label={this.handlerManager.getLabel("changeWordTypeToRegular")}
            onClick={this.handlerManager.getHandler("changeWordTypeToRegular")}
          />
        </MenuItem>
        <MenuItem
          text={this.trans("mainNavbar.shuffleResult")}
          label={this.handlerManager.getLabel("shuffleResult")}
          onClick={this.handlerManager.getHandler("shuffleResult")}
          icon="random"
        />
        <MenuDivider/>
        <MenuItem
          text={this.trans("mainNavbar.searchAdvanced")}
          label={this.handlerManager.getLabel("searchAdvanced")}
          onClick={this.handlerManager.getHandler("searchAdvanced")}
          icon="blank"
        />
        <MenuItem
          text={this.trans("mainNavbar.searchScript")}
          label={this.handlerManager.getLabel("searchScript")}
          onClick={this.handlerManager.getHandler("searchScript")}
          icon="blank"
        />
      </Menu>
    );
    return node;
  }

  private renderEditMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem
          text={this.trans("mainNavbar.createWord")}
          label={this.handlerManager.getLabel("createWord")}
          onClick={this.handlerManager.getHandler("createWord")}
          icon="blank"
        />
      </Menu>
    );
    return node;
  }

  private renderHelpMenu(): ReactElement {
    let node = (
      <Menu>
        <MenuItem
          text={this.trans("mainNavbar.openDevTools")}
          label={this.handlerManager.getLabel("openDevTools")}
          onClick={this.handlerManager.getHandler("openDevTools")}
          icon="blank"
        />
        <MenuDivider/>
        <MenuItem
          text={this.trans("mainNavbar.openHelp")}
          label={this.handlerManager.getLabel("openHelp")}
          onClick={this.handlerManager.getHandler("openHelp")}
          icon="help"
        />
        <MenuItem
          text={this.trans("mainNavbar.aboutApplication")}
          label={this.handlerManager.getLabel("aboutApplication")}
          onClick={this.handlerManager.getHandler("aboutApplication")}
          icon="blank"
        />
      </Menu>
    );
    return node;
  }

  private renderHotkeys(): ReactNode {
    let manager = this.handlerManager;
    let node = <GlobalHotKeys keyMap={manager.getKeys()} handlers={manager.getHandlers()}/>;
    return node;
  }

  private createHandlerManager(): HandlerManager {
    let manager = new HandlerManager({
      openDictionary: {key: "ctrl+o"},
      reopenDictionary: {key: "ctrl+shift+o"},
      saveDictionary: {key: "ctrl+s"},
      changeWordModeToName: {key: "ctrl+w", handler: () => this.props.changeWordMode("name")},
      changeWordModeToEquivalent: {key: "ctrl+e", handler: () => this.props.changeWordMode("equivalent")},
      changeWordModeToBoth: {key: "ctrl+shift+w", handler: () => this.props.changeWordMode("both")},
      changeWordModeToContent: {key: "ctrl+q", handler: () => this.props.changeWordMode("content")},
      changeWordTypeToExact: {key: "ctrl+shift+t", handler: () => this.props.changeWordType("exact")},
      changeWordTypeToPrefix: {key: "ctrl+t", handler: () => this.props.changeWordType("prefix")},
      changeWordTypeToSuffix: {handler: () => this.props.changeWordType("suffix")},
      changeWordTypeToPart: {handler: () => this.props.changeWordType("part")},
      changeWordTypeToPair: {key: "ctrl+shift+g", handler: () => this.props.changeWordType("pair")},
      changeWordTypeToRegular: {key: "ctrl+g", handler: () => this.props.changeWordType("regular")},
      shuffleResult: {key: "ctrl+r"},
      searchAdvanced: {key: "ctrl+f"},
      searchScript: {key: "ctrl+shift+f"},
      createWord: {key: "ctrl+n", handler: () => this.props.createWord()},
      openDevTools: {key: "f12", handler: () => this.openDevTools()},
      openHelp: {key: "f1"}
    });
    return manager;
  }

  public render(): ReactNode {
    let hotkeyNode = this.renderHotkeys();
    let version = "dev" + HairianUtil.getHairia(process.env["BUILD_DATE"]);
    let node = (
      <Fragment>
        <Navbar fixedToTop={true}>
          <NavbarGroup align="left">
            <NavbarHeading>
              <strong>{this.trans("mainNavbar.title")}</strong><br/>
              <small className="bp3-text-muted">ver {version}</small>
            </NavbarHeading>
          </NavbarGroup>
          <NavbarGroup align="left">
            <Popover2 content={this.renderFileMenu()} position="bottom-left">
              <Button text={this.trans("mainNavbar.file")} minimal={true}/>
            </Popover2>
            <Popover2 content={this.renderSearchMenu()} position="bottom-left">
              <Button text={this.trans("mainNavbar.search")} minimal={true}/>
            </Popover2>
            <Popover2 content={this.renderEditMenu()} position="bottom-left">
              <Button text={this.trans("mainNavbar.edit")} minimal={true}/>
            </Popover2>
            <Button text={this.trans("mainNavbar.git")} minimal={true}/>
            <Button text={this.trans("mainNavbar.tool")} minimal={true}/>
            <Popover2 content={this.renderHelpMenu()} position="bottom-left">
              <Button text={this.trans("mainNavbar.help")} minimal={true}/>
            </Popover2>
          </NavbarGroup>
        </Navbar>
        {hotkeyNode}
      </Fragment>
    );
    return node;
  }

}


type Props = {
  changeWordMode: (mode: WordMode) => void,
  changeWordType: (type: WordType) => void,
  createWord: () => void
};
type State = {
};