import React from "react";
import ComposedComponent from "./ComposedComponent";

type Props = {
  errorText: any;
  showErrors: boolean;
  onChange: any;
  form: any;
  model: any;
  value: any;
  setDefault: any;
  error: any;
  onChangeValidate: any;
  otherProps?: { multiline: boolean; rows: any; maxRows: any };
};

class Text extends React.Component<Props> {
  static defaultProps: { otherProps: any };
  constructor(props: Props) {
    super(props);
    const { model, form, value, setDefault } = this.props;
    const { key } = form;
    setDefault(key, model, form, value);
  }

  render() {
    const { form, error, value, onChangeValidate, otherProps } = this.props;
    return (
      <div className="">
        <label>{form.title}</label>
        {form.type === "textarea" ? (
          <textarea
            style={form.style}
            defaultValue={value || ""}
            {...form.otherProps}
            {...otherProps}
          ></textarea>
        ) : (
          <input
            type={form.type}
            placeholder={form.placeholder}
            onChange={onChangeValidate}
            defaultValue={value || ""}
            disabled={form.readonly}
            required={form.required}
            style={form.style}
            {...otherProps}
            {...form.otherProps}
          />
        )}
        {form.description && <p className="text-sm">{form.description}</p>}
        {error && <div className="error">{error}</div>}
      </div>
    );
  }
}

Text.defaultProps = {
  otherProps: undefined,
};

export default ComposedComponent(Text);
