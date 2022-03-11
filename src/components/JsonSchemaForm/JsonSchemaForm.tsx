import React, { Component } from "react";
import merge from "lodash/merge";
import isNil from "lodash/isNil";
import utils from "./utils";
import Text from "./Text";
import Select from "./Select";
import DateComponent from "./Date";
import TextArea from "./TextArea";

type Props = {
  onModelChange?: any;
  errors?: any;
  schema: any;
  form: any;
  ignore?: any;
  option?: any;
  model: any;
  className?: any;
  mapper?: any;
  showErrors?: boolean;
  evalContext?: any;
};

const formatDate = (date: string | Date) => {
  let value: any =
    (date && typeof date === "object" && date.toISOString().slice(0, 10)) ||
    date;
  if (!value) value = "";
  if (value.length > 0) value = new Date(value).toISOString().slice(0, 10);
  return value;
};

class JsonSchemaForm extends Component<Props> {
  mapper: { [x: string]: any } = {
    number: Number,
    text: Text,
    password: Text,
    textarea: TextArea,
    // markdown: Markdown,
    // textsuggest: TextSuggest,
    select: Select,
    // taxonomy: Taxonomy,
    // radios: Radios,
    date: DateComponent,
    // timestamp: Timestamp,
    // checkbox: Checkbox,
    // help: Help,
    // array: Array,
    // tBoolean: TripleBoolean,
    // fieldset: FieldSet,
    // tuple: FieldSet,
    // multiselect: MultiSelect,
  };

  constructor(props: Props) {
    super(props);
    this.builder = this.builder.bind(this);
  }

  // Assign default values and save it to the model
  setDefault = (
    key: any,
    model: { [x: string]: any },
    form: { type: any },
    value: any
  ) => {
    const { onModelChange } = this.props;
    const currentValue = utils.selectOrSet(key, model);

    // If current value is not setted and exist a default, apply the default over the model
    if (isNil(currentValue) && !isNil(value))
      onModelChange(key, value, form.type, form);
  };

  getLocalization = () => {
    return {
      getLocalizedString: (value: string) => value,
      getLocalizedNumber: (value: number) => value,
      getLocalizedDate: formatDate,
    };
  };

  builder(
    form: { type: string | number; condition: any; key: any[] },
    model: any,
    index: any,
    mapper: { [x: string]: any },
    onChange: any,
    builder: (
      form: any,
      model: any,
      index: any,
      mapper: any,
      onChange: any,
      builder: any
    ) => JSX.Element | null
  ) {
    const { errors, showErrors, evalContext } = this.props;
    const Field = this.mapper[form.type];
    if (!Field) {
      return null;
    }

    // Apply conditionals to review if this field must be rendered
    if (
      form.condition &&
      !utils.safeEval(form.condition, { model, form, ...evalContext })
    ) {
      return null;
    }

    const key = (form.key && form.key.join(".")) || index;

    const error = errors && key in errors ? errors[key] : null;

    return (
      <Field
        model={model}
        form={form}
        key={key}
        onChange={onChange}
        setDefault={this.setDefault}
        mapper={mapper}
        builder={builder}
        errorText={error}
        localization={this.getLocalization()}
        showErrors={showErrors}
      />
    );
  }

  render() {
    const {
      schema,
      form,
      ignore,
      option,
      model,
      className,
      onModelChange,
      mapper,
    } = this.props;
    const merged = utils.merge(schema, form, ignore, option, false);

    let mergedMapper = this.mapper;
    if (mapper) {
      mergedMapper = merge(this.mapper, mapper);
    }
    const forms = merged.map(
      (
        formPart: { type: string | number; condition: any; key: any[] },
        index: any
      ) =>
        this.builder(
          formPart,
          model,
          index,
          mergedMapper,
          onModelChange,
          this.builder
        )
    );

    return <div className={className}>{forms}</div>;
  }
}

export default JsonSchemaForm;
