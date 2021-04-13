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

  // メインプロセスに非同期でメッセージを送信します。
  // 仕様変更をしやすくするため、window.api のメソッドを直接呼ぶのは避け、このメソッドを利用してください。
  protected send(channel: string, ...args: Array<any>): void {
    return window.api.send(channel, ...args);
  }

  // メインプロセスに非同期でメッセージを送信し、結果が返されるまで待機します。
  // 仕様変更をしやすくするため、window.api のメソッドを直接呼ぶのは避け、このメソッドを利用してください。
  protected sendAsync(channel: string, ...args: Array<any>): Promise<any> {
    return window.api.sendAsync(channel, ...args);
  }

  protected createWindow(mode: string, props: object, options: BrowserWindowConstructorOptions): void {
    window.api.send("createWindow", mode, props, options);
  }

  // 新しいウィンドウを非同期で開き、そのウィンドウが閉じられるまで待機します。
  // 開かれたウィンドウのレンダラープロセスにおいて、closeWindow メソッドが呼ばれたときの引数が返されます。
  // closeWindow メソッドが引数なしで呼ばれた場合か、閉じるボタンでウィンドウが閉じられた場合は、代わりに null が返されます。
  protected createWindowAsync(mode: string, props: object, options: BrowserWindowConstructorOptions): Promise<any | null> {
    let respondIdString = this.props.store!.id.toString();
    let respondChannel = "create-window-async" + uuid();
    let query = {respondIdString, respondChannel};
    let promise = new Promise((resolve, reject) => {
      window.api.once(respondChannel, (event, exitCode, data) => {
        if (exitCode !== 0) {
          reject(data);
        } else {
          resolve(data);
        }
      });
      window.api.send("createWindow", mode, props, {...options, query});
    });
    return promise;
  }

  // 現在のウィンドウを閉じます。
  // 現在のウィンドウが createWindowAsync メソッドで作られたものである場合、この関数の引数にデータを渡すことで、ウィンドウを作ったプロセスにそのデータを返信することができます。
  // 引数を省略した場合は、ウィンドウを作ったプロセスには null が返信されます。
  protected closeWindow(data?: unknown): void {
    let respondId = this.props.store!.respondId;
    let respondChannel = this.props.store!.respondChannel;
    if (respondId !== null && respondChannel !== null) {
      window.api.sendTo(respondId, respondChannel, 0, data ?? null);
    }
    window.api.send("closeWindow");
  }

}


type AdditionalProps = {
  styles: StylesRecord,
  intl: IntlShape,
  store: GlobalStore
};

type Props<P> = Partial<AdditionalProps> & P;

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type StylesRecord = {[key: string]: string | undefined};
type FormatFunction<T, R> = (parts: Array<string | T>) => R;