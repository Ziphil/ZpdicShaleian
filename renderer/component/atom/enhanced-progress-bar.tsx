//

import {
  ProgressBar
} from "@blueprintjs/core";
import {
  IntlShape,
  createIntl,
  createIntlCache
} from "@formatjs/intl";
import * as react from "react";
import {
  Component,
  ReactNode
} from "react";


export class EnhancedProgressBar extends Component<Props, State> {

  private static intl: IntlShape<string> = createIntl({locale: "ja"}, createIntlCache());

  public render(): ReactNode {
    let progress = (this.props.size > 0) ? this.props.offset / this.props.size : 0;
    let percent = progress * 100;
    let offset = this.props.offset;
    let size = this.props.size;
    let detailNode = (this.props.showDetail) && (
      <div className="zpi-enhanced-progress-bar-detail">
        <div className="zpi-enhanced-progress-bar-percent">
          {EnhancedProgressBar.intl.formatNumber(percent, {minimumFractionDigits: 2, maximumFractionDigits: 2})} %
        </div>
        <div className="zpi-enhanced-progress-bar-offset">
          {EnhancedProgressBar.intl.formatNumber(offset)} / {EnhancedProgressBar.intl.formatNumber(size)}
        </div>
      </div>
    );
    let node = (
      <div className={this.props.className}>
        <ProgressBar value={progress} intent={(progress >= 1) ? "success" : "primary"} stripes={progress < 1}/>
        {detailNode}
      </div>
    );
    return node;
  }

}


type Props = {
  offset: number,
  size: number,
  showDetail: boolean,
  className?: string
};
type State = {
};