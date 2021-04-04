//

import {
  inject,
  observer
} from "mobx-react";
import {
  ComponentClass
} from "react";
import {
  IntlShape,
  injectIntl
} from "react-intl";
import "reflect-metadata";
import {
  Component
} from "./component";
import {
  GlobalStore
} from "./store";


type DecoratorOptions = {
  inject?: boolean,
  injectIntl?: boolean,
  observer?: boolean
};
const DEFAULT_DECORATOR_OPTIONS = {
  inject: true,
  injectIntl: true,
  observer: false
};

export function component(options: DecoratorOptions = {}): ClassDecorator {
  let nextOptions = Object.assign({}, DEFAULT_DECORATOR_OPTIONS, options);
  let decorator = function <P, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
    if (nextOptions.observer) {
      component = wrappedObserver(component);
    }
    if (nextOptions.inject) {
      component = wrappedInject(component);
    }
    if (nextOptions.injectIntl) {
      component = wrappedInjectIntl(component);
    }
    return component;
  };
  return decorator as any;
}

function wrappedInject<P extends {store?: GlobalStore}, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  return inject("store")(component);
}

function wrappedInjectIntl<P extends {intl?: IntlShape}, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  let anyComponent = component as any;
  let resultComponent = injectIntl(anyComponent) as any;
  return resultComponent;
}

function wrappedObserver<P extends any, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  return observer(component);
}

const KEY = Symbol("key");

type Metadata = {sync: Handlers, async: Handlers};
type Handlers = Array<{channel: string, name: string | symbol}>;

type HandlerClassDecorator = (clazz: new(...args: any) => Component) => void;
type OnMethodDecorator = (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnMethod>) => void;
type OnAsyncMethodDecorator = (target: object, name: string | symbol, descriptor: TypedPropertyDescriptor<OnAsyncMethod>) => void;
type OnMethod = (...args: Array<any>) => void;
type OnAsyncMethod = (...args: Array<any>) => Promise<any>;

export function handler(): HandlerClassDecorator {
  let decorator = function (clazz: new(...args: any) => Component): void {
    let metadata = Reflect.getMetadata(KEY, clazz.prototype) as Metadata;
    clazz.prototype.setupIpc = function (this: Component): void {
      let anyThis = this as any;
      for (let {channel, name} of metadata.sync) {
        window.api.on(channel, (event, ...args) => anyThis[name].bind(this)(...args));
      }
      for (let {channel, name} of metadata.async) {
        window.api.onAsync(channel, (event, ...args) => anyThis[name].bind(this)(...args));
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