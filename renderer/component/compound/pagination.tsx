//

import {
  Button, ButtonGroup
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  CustomIcon
} from "../atom/custom-icon";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class Pagination extends Component<Props, State> {

  private handleSet(page: number | "first" | "last"): void {
    let minPage = this.props.minPage;
    let maxPage = this.props.maxPage;
    let nextPage = (() => {
      if (page === "first") {
        return 0;
      } else if (page === "last") {
        return maxPage;
      } else {
        return page;
      }
    })();
    let clampedPage = Math.max(Math.min(nextPage, maxPage), minPage);
    if (this.props.onSet) {
      this.props.onSet(clampedPage);
    }
  }

  private renderButtons(direction: -1 | 1): ReactNode {
    let nodes = [];
    let currentPage = this.props.page;
    let targetPage = (direction === -1) ? this.props.minPage : this.props.maxPage;
    let difference = 2;
    for (let i = 0 ; i < 5 ; i ++) {
      let nextPage = currentPage + (difference - 1) * direction;
      if ((direction === -1 && nextPage >= targetPage) || (direction === 1 && nextPage <= targetPage)) {
        let node = <Button key={nextPage} text={this.transNumber(nextPage + 1)} onClick={() => this.handleSet(nextPage)}/>;
        nodes.push(node);
      }
      difference *= 2;
    }
    if (direction === -1) {
      nodes.reverse();
    }
    return nodes;
  }

  public render(): ReactNode {
    let page = this.props.page;
    let leftButtonNode = this.renderButtons(-1);
    let rightButtonNode = this.renderButtons(1);
    let node = (
      <div className="zp-pagination">
        <div className="zp-pagination-leftmost">
          <ButtonGroup minimal={true}>
            <Button icon={<CustomIcon name="circleArrowLeftmost"/>} onClick={() => this.handleSet("first")}/>
            <Button icon="circle-arrow-left" onClick={() => this.handleSet(page - 1)}/>
          </ButtonGroup>
        </div>
        <div className="zp-pagination-left">
          <ButtonGroup minimal={true}>
            {leftButtonNode}
          </ButtonGroup>
        </div>
        <div className="zp-pagination-center">
          <Button text={this.transNumber(page + 1)} outlined={true} intent="primary"/>
        </div>
        <div className="zp-pagination-right">
          <ButtonGroup minimal={true}>
            {rightButtonNode}
          </ButtonGroup>
        </div>
        <div className="zp-pagination-rightmost">
          <ButtonGroup minimal={true}>
            <Button icon="circle-arrow-right" onClick={() => this.handleSet(page + 1)}/>
            <Button icon={<CustomIcon name="circleArrowRightmost"/>} onClick={() => this.handleSet("last")}/>
          </ButtonGroup>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
  page: number,
  minPage: number
  maxPage: number
  onSet?: (page: number) => void
};
type State = {
};