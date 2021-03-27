//

import {
  Button,
  MenuItem
} from "@blueprintjs/core";
import {
  IItemRendererProps,
  Select as BlueprintSelect
} from "@blueprintjs/select";
import * as react from "react";
import {
  ReactElement,
  ReactNode,
  SyntheticEvent
} from "react";
import {
  Component
} from "../component";


export class Select<T extends string> extends Component<Props<T>, State> {

  private renderKeyItem(key: string, itemProps: IItemRendererProps): ReactElement | null {
    let modifiers = itemProps.modifiers;
    let node = (modifiers.matchesPredicate) && (
      <MenuItem key={key} text={key} active={modifiers.active} onClick={itemProps.handleClick}/>
    );
    return node || null;
  }

  public render(): ReactNode {
    let popoverProps = {
      position: "bottom-left",
      hoverOpenDelay: 0,
      usePortal: false,
      minimal: true,
      modifiers: {preventOverflow: {enabled: true, boundariesElement: "window"}, flip: {enabled: true, boundariesElement: "window"}}
    } as const;
    let node = (
      <AnySelect
        items={this.props.items}
        activeItem={this.props.activeItem}
        itemRenderer={this.renderKeyItem}
        filterable={false}
        popoverProps={popoverProps}
        onItemSelect={this.props.onItemSelect as any}
        className={this.props.className}
      >
        <Button className={this.props.buttonClassName} text={this.props.activeItem} alignText="left" rightIcon="double-caret-vertical"/>
      </AnySelect>
    );
    return node;
  }

}


type Props<T> = {
  items: Array<T>,
  activeItem: T,
  onItemSelect: (item: T, event?: SyntheticEvent<HTMLElement>) => void,
  className?: string,
  buttonClassName?: string
};
type State = {
};

let AnySelect = BlueprintSelect.ofType<string>();