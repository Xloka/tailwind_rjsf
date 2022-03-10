import React from 'react'
import ComposedComponent from './ComposedComponent'

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
  constructor(props: Props | Readonly<Props>) {
    super(props);
    const { model, form, value, setDefault } = this.props;
    const { key } = form;
    setDefault(key, model, form, value);
  }

  render() {
    const { form, error, value, onChangeValidate, otherProps } = this.props;
    return (
      <input
        type={form.type}
        label={form.title}
        placeholder={form.placeholder}
        helperText={error || form.description}
        error={!!error}
        onChange={onChangeValidate}
        value={value || ""}
        disabled={form.readonly}
        fullWidth
        required={form.required}
        style={form.style}
        {...otherProps}
        {...form.otherProps}
      />
    );
  }
}

Text.defaultProps = {
  otherProps: undefined
}

export default ComposedComponent(Text)