//

import {
  NormalParameter,
  Parameter
} from "soxsot";


export class ParameterUtil {

  public static getNormal(parameter: Parameter): NormalParameter {
    const language = parameter.language;
    if (parameter instanceof NormalParameter) {
      return parameter;
    } else {
      return NormalParameter.createEmpty(language);
    }
  }

}