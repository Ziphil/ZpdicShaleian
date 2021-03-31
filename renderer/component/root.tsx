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
  DictionarySettingsPage,
  EditorPage,
  MainPage
} from "./page";
import {
  GlobalStore
} from "./store";


@component({inject: false, injectIntl: false, observer: true})
export class Root extends Component<Props, State> {

  private store: GlobalStore = new GlobalStore();
  private messages: Record<string, string> = require("../language/ja.yml");

  public state: State = {
    mode: "",
    props: null
  };

  public componentDidMount(): void {
    let query = queryParser.parse(window.location.search);
    let mode = query.mode;
    let idString = query.idString;
    if (typeof mode === "string" && typeof idString === "string") {
      let id = parseInt(idString, 10);
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
      } else if (mode === "editor") {
        return <EditorPage {...props}/>;
      } else if (mode === "dictionary-settings") {
        return <DictionarySettingsPage {...props}/>;
      }
    } else {
      return <div/>;
    }
  }

  public render(): ReactNode {
    let pageNode = this.renderPage();
    let node = (
      <Provider store={this.store}>
        <IntlProvider defaultLocale="ja" locale="ja" messages={this.messages}>
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
  props: any | null
};