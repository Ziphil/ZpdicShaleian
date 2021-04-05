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
    let offset = this.props.progress.offset;
    let size = this.props.progress.size;
    let ratio = (size > 0) ? offset / size : 0;
    let percent = ratio * 100;
    let detailNode = (this.props.showDetail) && (
      <div className="zpepb-detail">
        <div className="zpepb-percent">
          {EnhancedProgressBar.intl.formatNumber(percent, {minimumFractionDigits: 2, maximumFractionDigits: 2})} %
        </div>
        <div className="zpepb-offset">
          {EnhancedProgressBar.intl.formatNumber(offset)} / {EnhancedProgressBar.intl.formatNumber(size)}
        </div>
      </div>
    );
    let node = (
      <div className={this.props.className}>
        <ProgressBar value={ratio} intent={(ratio >= 1) ? "success" : "primary"} stripes={ratio < 1}/>
        {detailNode}
      </div>
    );
    return node;
  }

}


type Props = {
  progress: Progress,
  showDetail: boolean,
  className?: string
};
type State = {
};

export type Progress = {offset: number, size: number};