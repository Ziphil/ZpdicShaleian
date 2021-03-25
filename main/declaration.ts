//


declare module "electron-connect" {

  class ProcessManager {
    public start(args?: string | Array<string>, callback?: () => void): void;
    public restart(args?: string | Array<string>, callback?: () => void): void;
    public reload(ids?: string | Array<string>): void;
    public stop(callback?: () => void): void;
    public on(name: string, callback: (...args: Array<any>) => any): void;
    public broadcast(name: string, data?: object): void;
  }

  class Client {
    public id: any;
    public on(name: string, callback: (...args: Array<any>) => any): void;
    public sendMessage(name: string, data?: object): void;
  }

  class ClientStatic {
    public create(browserWindow?: object, options?: object, callback?: () => void): Client;
  }

  class ServerStatic {
    public create(options?: object): ProcessManager;
  }

  let client: ClientStatic;
  let server: ServerStatic;

}