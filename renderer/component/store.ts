//

import {
  observable
} from "mobx";


export class GlobalStore {

  @observable
  public id: string = "";

  @observable
  public messages: Record<string, string> = {};

}