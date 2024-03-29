//

import {
  Button,
  MenuItem
} from "@blueprintjs/core";
import {
  Select as BlueprintSelect,
  IItemRendererProps
} from "@blueprintjs/select";
import * as react from "react";
import {
  Component,
  ReactElement,
  ReactNode,
  SyntheticEvent
} from "react";


export class SimpleSelect<T> extends Component<Props<T>, State> {

  private renderItem(item: T, itemProps: IItemRendererProps): ReactElement | null {
    const modifiers = itemProps.modifiers;
    const text = (this.props.getMenuText ?? this.props.getText)(item);
    const node = (modifiers.matchesPredicate) && (
      <MenuItem key={text} text={text} active={modifiers.active} onClick={itemProps.handleClick}/>
    );
    return node || null;
  }

  public render(): ReactNode {
    const popoverProps = {
      position: "bottom-left",
      hoverOpenDelay: 0,
      minimal: true,
      modifiers: {preventOverflow: {enabled: true, boundariesElement: "window"}, flip: {enabled: true, boundariesElement: "window"}}
    } as const;
    const node = (
      <AnySelect
        items={this.props.items}
        activeItem={this.props.activeItem}
        itemRenderer={this.renderItem.bind(this)}
        filterable={false}
        popoverProps={popoverProps}
        onItemSelect={this.props.onItemSelect as any}
        className={this.props.className}
      >
        <Button className={this.props.buttonClassName} text={this.props.getText(this.props.activeItem)} alignText="left" rightIcon="double-caret-vertical"/>
      </AnySelect>
    );
    return node;
  }

}


type Props<T> = {
  items: Array<T>,
  activeItem: T,
  getText: (item: T) => string,
  getMenuText?: (item: T) => string,
  onItemSelect: (item: T, event?: SyntheticEvent<HTMLElement>) => void,
  className?: string,
  buttonClassName?: string
};
type State = {
};

const AnySelect = BlueprintSelect.ofType<any>();