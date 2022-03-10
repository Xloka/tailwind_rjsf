import React from 'react'
import utils from './utils'

const defaultValue = (props: Props) => {
  // check if there is a value in the model, if there is, display it. Otherwise, check if
  // there is a default value, display it.
  let value: any
  if (props.form && props.form.key)
    value = utils.selectOrSet(props.form.key, props.model)

  // check if there is a default value
  if (value === null || value === undefined) {
    if (props.form.default) {
      value = props.form.default
    } else if (props.form.schema && props.form.schema.default) {
      value = props.form.schema.default
    }
  }
  return value
}

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
  otherProps?: { multiline: boolean; rows: any; maxRows: any; };
};

const getDisplayName = (WrappedComponent: any) =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'

export default (ComposedComponent: any, defaultProps = {}) =>
  class Composed extends React.Component<Props> {
    displayName: string;
    constructor(props: Props | Readonly<Props>) {
      super(props);
      this.displayName = `ComposedComponent(${getDisplayName(
        ComposedComponent
      )})`;
      this.onChangeValidate = this.onChangeValidate.bind(this);
      this.state = Composed.getDerivedStateFromProps(this.props);
    }

    static getDerivedStateFromProps(nextProps: Props | Readonly<Props>) {
      const { errorText, form, showErrors } = nextProps;
      const value = defaultValue(nextProps);
      if (!showErrors) {
        return {
          value,
          valid: true,
          error: "",
        };
      }

      const validationResult = utils.validate(form, value || undefined);

      const error = !validationResult.valid
        ? validationResult.error
        : undefined;

      return {
        value,
        valid: validationResult.valid,
        error: (!validationResult.valid ? error.message : null) || errorText,
      };
    }

    /**
     * Called when <input> value changes.
     * @param e The input element, or something.
     */
    onChangeValidate(
      e: { target: { checked?: any; value: any } },
      v: any
    ): void {
      const { form, onChange } = this.props; // eslint-disable-line
      let value = null;
      // use the schema type so that we can have a limited number of types to handle. This
      // gives us the flexibility to create add-ons without touching the code of main project.
      const type = form.schema ? form.schema.type : form.type;
      // console.log(type)
      switch (type) {
        case "integer":
        case "number": {
          value = e;
          break;
        }
        case "boolean":
          value = e.target.checked;
          break;
        case "array":
          value = e;
          break;
        case "object":
          if (form.type === "date") {
            if (e.target.value.length > 0) {
              value = new Date(e.target.value);
            } else {
              value = "";
            }
            break;
          }
          ({ value } = e.target);
          break;
        default:
          // string goes here.
          ({ value } = e.target);
      }

      const validationResult = utils.validate(form, value);
      this.setState({
        value,
        valid: validationResult.valid,
        error: validationResult.valid ? null : validationResult.error.message,
      });

      onChange(form.key, value);
    }

    render() {
      return (
        <ComposedComponent
          {...defaultProps}
          {...this.props}
          {...this.state}
          onChangeValidate={this.onChangeValidate}
        />
      );
    }
  };