import React from "react";
import ComposedComponent from "./ComposedComponent";
import Text from "./Text";
import { Props } from "../../type";


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
