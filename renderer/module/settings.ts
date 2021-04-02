//


export class Settings {

  public defaultDictionaryPath?: string;
  public defaultCommitMessage?: string;

  private constructor(object: any) {
    Object.assign(this, object);
  }

  public static fromString(string: string): Settings {
    let object = JSON.parse(string);
    let settings = new Settings(object);
    return settings;
  }

  public toString(): string {
    let string = JSON.stringify(this, null, 2);
    return string;
  }

  public static createEmpty(): Settings {
    let settings = new Settings({});
    return settings;
  }

}