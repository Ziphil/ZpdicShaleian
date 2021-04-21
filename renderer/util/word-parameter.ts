//

import {
  NormalWordParameter,
  WordParameter
} from "soxsot";


export class WordParameterUtil {

  public static getNormal(parameter: WordParameter): NormalWordParameter {
    let language = parameter.language;
    if (parameter instanceof NormalWordParameter) {
      return parameter;
    } else {
      return NormalWordParameter.createEmpty(language);
    }
  }

}