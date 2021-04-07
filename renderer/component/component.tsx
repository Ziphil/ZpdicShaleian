//

import {
  BrowserWindowConstructorOptions
} from "electron";
import {
  Component as ReactComponent,
  ReactNode
} from "react";
import {
  IntlShape
} from "react-intl";
import {
  v4 as uuid
} from "uuid";
import {
  GlobalStore
} from "./store";


export class Component<P = {}, S = {}, H = any> extends ReactComponent<Props<P>, S, H> {

  public constructor(props?: any) {
    super(props);
    this.initialize();
  }

  protected initialize(): void {
  }

  protected setupIpc(): void {
  }

  protected trans(id: string | number, values?: Record<string, Primitive | FormatFunction<string, string>>): string;
  protected trans(id: string | number, values?: Record<string, Primitive | ReactNode | FormatFunction<ReactNode, ReactNode>>): ReactNode;
  protected trans(id: string | number, values?: Record<string, any>): ReactNode {
    let defaultMessage = "[?]";
    return this.props.intl!.formatMessage({id, defaultMessage}, values);
  }

  protected transNumber(number: number | null | undefined, digit?: number): string {
    let options = {minimumFractionDigits: digit, maximumFractionDigits: digit};
    if (number !== null && number !== undefined) {
      return this.props.intl!.formatNumber(number, options);
    } else {
      return this.props.intl!.formatMessage({id: "common.numberUndefined"});
    }
  }

  protected closeWindow(): void {
    window.api.send("close-window");
  }

  protected destroyWindow(): void {
    window.api.send("destroy-window");
  }

  protected createWindow(mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    window.api.send("create-window", mode, props, options);
  }

  protected createWindowAsync(mode: string, props: object, options: BrowserWindowConstructorOptions): Promise<any | null> {
    let respondIdString = this.props.store!.id.toString();
    let respondChannel = "create-window-async" + uuid();
    let query = {respondIdString, respondChannel};
    let promise = new Promise((resolve, reject) => {
      window.api.once(respondChannel, (event, data) => {
        resolve(data);
      });
      window.api.send("create-window", mode, props, {...options, query});
    });
    return promise;
  }

  protected respond(data?: any): void {
    let respondId = this.props.store!.respondId;
    let respondChannel = this.props.store!.respondChannel;
    if (respondId !== null && respondChannel !== null) {
      window.api.sendTo(respondId, respondChannel, data ?? null);
    }
  }

}


type AdditionalProps = {
  intl: IntlShape,
  store: GlobalStore
};

type Props<P> = Partial<AdditionalProps> & P;

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type FormatFunction<T, R> = (parts: Array<string | T>) => R;