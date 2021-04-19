//


export class ObjectUtil {

  public static keys<T extends object>(object: T): Array<keyof T> {
    return Object.keys(object) as any;
  }

  public static entries<T extends object>(object: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(object) as any;
  }

  public static get<T extends object, K extends string>(object: T, key: K): T[keyof T] | undefined {
    let anyObject = object as any;
    return anyObject[key];
  }

}