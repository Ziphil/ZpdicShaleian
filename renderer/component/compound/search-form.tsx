//

import {
  ControlGroup,
  InputGroup
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Select
} from "../atom";
import {
  Component
} from "../component";
import {
  NormalWordParameter,
  WORD_MODES,
  WordMode,
  WordParameter,
  WORD_TYPES,
  WordType,
} from "../../module";


export class SearchForm extends Component<Props, State> {

  private getNormalWordParameter(): NormalWordParameter {
    let parameter = this.props.parameter;
    let language = parameter.language;
    if (parameter instanceof NormalWordParameter) {
      return parameter;
    } else {
      return NormalWordParameter.createEmpty(language);
    }
  }

  private handleParameterSet(nextParameter: {search?: string, mode?: WordMode, type?: WordType}): void {
    if (this.props.onParameterSet) {
      let oldParameter = this.getNormalWordParameter();
      let search = nextParameter.search ?? oldParameter.search;
      let mode = nextParameter.mode ?? oldParameter.mode;
      let type = nextParameter.type ?? oldParameter.type;
      let language = oldParameter.language;
      let parameter = new NormalWordParameter(search, mode, type, language);
      this.props.onParameterSet(parameter);
    }
  }

  public render(): ReactNode {
    let parameter = this.getNormalWordParameter();
    let node = (
      <div className="zp-search-form">
        <ControlGroup fill={true}>
          <InputGroup value={parameter.search} fill={true} onChange={(event) => this.handleParameterSet({search: event.target.value})}/>
          <Select buttonClassName="zp-search-form-select" items={[...WORD_MODES]} activeItem={parameter.mode} onItemSelect={(mode) => this.handleParameterSet({mode})}/>
          <Select buttonClassName="zp-search-form-select" items={[...WORD_TYPES]} activeItem={parameter.type} onItemSelect={(type) => this.handleParameterSet({type})}/>
        </ControlGroup>
      </div>
    );
    return node;
  }

}


type Props = {
  parameter: WordParameter,
  onParameterSet?: (parameter: WordParameter) => void;
};
type State = {
};