import React, { useState, useEffect } from "react";
import { Props } from "./type";
import ComposedComponent from "./ComposedComponent";
import utils from "./utils";

const Checkboxes = (props: Props) => {
  const {
    model,
    form,
    error,
    setDefault,
    onChange,
    onChangeValidate,
    form: {
      key,
      schema: { isObject, enum: values },
    },
  } = props;

  let defaultValue = [];
  if (props.form.default) {
    defaultValue = props.form.default;
  } else if (props.form.schema && props.form.schema.default) {
    defaultValue = props.form.schema.default;
  }
  const [currentValue, setCurrentValue] = useState(
    utils.getValueFromModel(model, form.key) || defaultValue
  );

  useEffect(() => {
    setDefault(key, model, form, currentValue);
  }, []);

  const onSelected = (event: { target: { value: any } }) => {
    const selectedValue = event.target.value;
    if (form.schema.type === "array") {
      if (currentValue.includes(selectedValue)) {
        setCurrentValue(
          currentValue.filter((each: any) => each !== selectedValue)
        );
        onChange(
          key,
          currentValue.filter((each: any) => each !== selectedValue)
        );
      } else {
        setCurrentValue([...currentValue, selectedValue]);
        onChange(key, [...currentValue, selectedValue]);
      }
    } else if (form.schema.type === "string") {
      setCurrentValue(selectedValue);
      onChange(key, selectedValue);
    }
    onChangeValidate(event);
  };

  const getLabel = (each: any) => {
    if (form.titleMap && form.titleMap.length > 0) {
      let titleMap = form.titleMap.filter((item: any) => item.value === each);
      if (titleMap.length > 0) {
        return titleMap[0].name;
      }
    }
    return each;
  };

  let menuItems = [];
  if (isObject) {
    menuItems = form.schema.enum.map(
      (
        item: string | number | readonly string[] | undefined,
        idx: React.Key | null | undefined
      ) => (
        <div key={idx}>
          <input
            type="checkbox"
            value={item}
            checked={currentValue.includes(item)}
            onChange={onSelected}
          />
          <label>{getLabel(item)}</label>
        </div>
      )
    );
  } else {
    menuItems = form.schema.enum.map(
      (
        item: string | number | readonly string[] | undefined,
        idx: React.Key | null | undefined
      ) => (
        <div key={idx}>
          <input
            type="checkbox"
            value={item}
            checked={currentValue.includes(item)}
            onChange={onSelected}
          />
          <label>{getLabel(item)}</label>
        </div>
      )
    );
  }

  return (
    <div className="form-group">
      <label className="control-label">{form.title}</label>
      {menuItems}
      {error && <span {...form.helperTextProps}>{error}</span>}
    </div>
  );
};

export default ComposedComponent(Checkboxes);
