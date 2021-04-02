//

import {
  App
} from "electron";
import "reflect-metadata";
import {
  Main
} from "../index";
import {
  PromisifiedIpcMain
} from "../util/ipc/ipc-main";
import {
  Handler
} from "./handler";


const KEY = Symbol("key");

type Metadata = {sync: Handlers, async: Handlers};
type Handlers = Array<{channel: string, name: string | symbol}>;

type HandlerClassDecorator = (clazz: new(...args: any) => Handler) => void;
type OnMethodDecorator = (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnMethod>) => void;
type OnAsyncMethodDecorator = (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnAsyncMethod>) => void;
type OnMethod = Parameters<PromisifiedIpcMain["on"]>[1] & ThisType<Main>;
type OnAsyncMethod = Parameters<PromisifiedIpcMain["onAsync"]>[1] & ThisType<Main>;

export function handler(): HandlerClassDecorator {
  let decorator = function (clazz: new(...args: any) => Handler): void {
    let metadata = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
    clazz.prototype.setup = function (this: Handler, app: App): void {
      let anyThis = this as any;
      let anyApp = app as any;
      for (let {channel, name} of metadata.sync) {
        anyApp.ipcMain.on(channel, anyThis[name].bind(app));
      }
      for (let {channel, name} of metadata.async) {
        anyApp.ipcMain.onAsync(channel, anyThis[name].bind(app));
      }
    };
  };
  return decorator;
}

export function on(channel: string): OnMethodDecorator {
  let decorator = function (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnMethod>): void {
    let metadata = Reflect.getMetadata(KEY, target) as Metadata;
    if (!metadata) {
      metadata = {sync: [], async: []};
      Reflect.defineMetadata(KEY, metadata, target);
    }
    metadata.sync.push({channel, name});
  };
  return decorator;
}

export function onAsync(channel: string): OnAsyncMethodDecorator {
  let decorator = function (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnAsyncMethod>): void {
    let metadata = Reflect.getMetadata(KEY, target) as Metadata;
    if (!metadata) {
      metadata = {sync: [], async: []};
      Reflect.defineMetadata(KEY, metadata, target);
    }
    metadata.async.push({channel, name});
  };
  return decorator;
}