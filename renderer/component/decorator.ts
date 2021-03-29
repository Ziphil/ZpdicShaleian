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
import {
  GlobalStore
} from "./store";


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