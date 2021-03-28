//

import {
  Provider
} from "mobx-react";
import * as queryParser from "query-string";
import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  IntlProvider
} from "react-intl";
import {
  component
} from "./decorator";
import {
  MainPage
} from "./page/main-page";
import {
  GlobalStore
} from "./store";


@component({inject: false, injectIntl: false, observer: true})
export class Root extends Component<Props, State> {

  private store: GlobalStore = new GlobalStore();

  public state: State = {
    mode: "",
    props: null
  };

  public componentDidMount(): void {
    let query = queryParser.parse(window.location.search);
    let mode = query.mode;
    let id = query.id;
    if (typeof mode === "string" && typeof id === "string") {
      window.api.send("ready-get-props", id);
      window.api.on("get-props", (event, props) => {
        this.setState({props}, () => {
          window.api.send("ready-show", id);
        });
      });
      this.store.id = id;
      this.setState({mode});
    }
  }

  public renderPage(): ReactNode {
    let props = this.state.props;
    let mode = this.state.mode;
    if (props !== null) {
      if (mode === "main") {
        return <MainPage {...props}/>;
      } else {
        return <div/>;
      }
    } else {
      return <div/>;
    }
  }

  public render(): ReactNode {
    let pageNode = this.renderPage();
    let node = (
      <Provider store={this.store}>
        <IntlProvider defaultLocale="ja" locale="ja" messages={{}}>
          {pageNode}
        </IntlProvider>
      </Provider>
    );
    return node;
  }

}


type Props = {
};
type State = {
  mode: string,
  props: object | null
};