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

  protected async getPackaged(): Promise<boolean> {
    let packaged = await window.api.sendAsync("get-packaged");
    return packaged;
  }

}


type AdditionalProps = {
  intl: IntlShape,
  store: GlobalStore
};

type Props<P> = Partial<AdditionalProps> & P;

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type FormatFunction<T, R> = (parts: Array<string | T>) => R;