//


export class Settings {

  public defaultDictionaryPath?: string;
  public defaultCommitMessage?: string;
  public uploadDictionaryUrl?: string;
  public uploadDictionaryPassword?: string;

  public constructor(object: any) {
    Object.assign(this, object);
  }

  public static createEmpty(): Settings {
    let settings = new Settings({});
    return settings;
  }

}