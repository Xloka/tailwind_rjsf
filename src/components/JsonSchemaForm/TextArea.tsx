import React from "react";
import ComposedComponent from "./ComposedComponent";
import Text from "./Text";

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
  otherProps?: { multiline?: boolean; rows?: any; maxRows?: any };
};

const TextArea = (props: Props) => {
  const { form } = props;
  return (
    <Text
      {...props}
      otherProps={{
        rows: form.rows,
      }}
    />
  );
};

export default ComposedComponent(TextArea);
