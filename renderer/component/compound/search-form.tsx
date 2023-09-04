//

import {
  ControlGroup,
  IRef,
  InputGroup,
  Tag
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  NormalParameter,
  Parameter,
  SearchResult,
  WORD_MODES,
  WORD_TYPES,
  WordMode,
  WordType
} from "soxsot";
import {
  ParameterUtil
} from "../../util/parameter";
import {
  SimpleSelect
} from "../atom";
import {
  Component
} from "../component";
import {
  component
} from "../decorator";


@component()
export class SearchForm extends Component<Props, State> {

  private handleParameterSet(nextParameter: {search?: string, mode?: WordMode, type?: WordType}): void {
    if (this.props.onParameterSet) {
      const oldParameter = ParameterUtil.getNormal(this.props.parameter);
      const text = nextParameter.search ?? oldParameter.text;
      const mode = nextParameter.mode ?? oldParameter.mode;
      const type = nextParameter.type ?? oldParameter.type;
      const language = this.props.language;
      const parameter = new NormalParameter(text, mode, type, language);
      this.props.onParameterSet(parameter);
    }
  }

  public render(): ReactNode {
    const parameter = ParameterUtil.getNormal(this.props.parameter);
    const supplementNode = (
      <Tag minimal={true}>
        {this.transNumber(this.props.searchResult.words.length)}
      </Tag>
    );
    const node = (
      <div className="zpscf-root">
        <ControlGroup fill={true}>
          <InputGroup
            value={parameter.text}
            rightElement={supplementNode}
            fill={true}
            inputRef={this.props.inputRef}
            onChange={(event) => this.handleParameterSet({search: event.target.value})}
          />
          <SimpleSelect
            className="zpscf-select"
            buttonClassName="zpscf-button"
            items={[...WORD_MODES]}
            activeItem={parameter.mode}
            getText={(mode) => this.trans(`common.modeShort.${mode}`)}
            getMenuText={(mode) => this.trans(`common.mode.${mode}`)}
            onItemSelect={(mode) => this.handleParameterSet({mode})}
          />
          <SimpleSelect
            className="zpscf-select"
            buttonClassName="zpscf-button"
            items={[...WORD_TYPES]}
            activeItem={parameter.type}
            getText={(type) => this.trans(`common.typeShort.${type}`)}
            getMenuText={(type) => this.trans(`common.type.${type}`)}
            onItemSelect={(type) => this.handleParameterSet({type})}
          />
        </ControlGroup>
      </div>
    );
    return node;
  }

}


type Props = {
  parameter: Parameter,
  language: string,
  searchResult: SearchResult,
  onParameterSet?: (parameter: Parameter) => void,
  inputRef?: IRef<HTMLInputElement>
};
type State = {
};