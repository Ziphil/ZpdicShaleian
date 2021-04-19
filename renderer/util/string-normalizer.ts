//


export class StringNormalizer {

  public static normalize(string: string, ignoreOptions?: IgnoreOptions): string {
    if (ignoreOptions !== undefined) {
      if (ignoreOptions.case) {
        string = string.toLowerCase();
      }
      if (ignoreOptions.diacritic) {
        string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
    return string;
  }

}


export type IgnoreOptions = {case: boolean, diacritic: boolean};