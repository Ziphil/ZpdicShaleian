//

import {
  observable
} from "mobx";


export class GlobalStore {

  @observable
  public id: number = -1;

  @observable
  public respondId: number | null = null;

  @observable
  public respondChannel: string | null = null;

}