//

import "reflect-metadata";
import {
  PromisifiedIpcMain,
  ipcMain
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
type OnMethod = Parameters<PromisifiedIpcMain["on"]>[1];
type OnAsyncMethod = Parameters<PromisifiedIpcMain["onAsync"]>[1];

export function handler(): HandlerClassDecorator {
  let decorator = function (clazz: new(...args: any) => Handler): void {
    let metadata = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
    clazz.prototype.setup = function (this: Handler): void {
      let anyThis = this as any;
      for (let {channel, name} of metadata.sync) {
        ipcMain.on(channel, anyThis[name].bind(this));
      }
      for (let {channel, name} of metadata.async) {
        ipcMain.onAsync(channel, anyThis[name].bind(this));
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