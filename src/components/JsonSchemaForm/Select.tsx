import React, { useState, useEffect } from "react";
import { Props } from "./type";
import ComposedComponent from "./ComposedComponent";
import utils from "./utils";

const Select = (props: Props) => {
  const {
    model,
    form,
    error,
    setDefault,
    onChange,
    onChangeValidate,
    form: {
      key,
      schema: { isObject, enum: values, findFn, displayFn, noLocalization },
    },
  } = props;

  let defaultValue =
    form && form.selectProps && form.selectProps.multiple ? [] : "";
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
    setCurrentValue(selectedValue);
    if (isObject) {
      const item = values.find((each: any) =>
        findFn ? findFn(each, selectedValue) : each === selectedValue
      );
      onChange(key, item);
    } else {
      onChangeValidate(event);
    }
  };

  const getLabel = (each: any) => {
    if (displayFn) {
      return displayFn(each);
    }
    return each.name;
  };

  let menuItems = [];
  if (isObject) {
    menuItems = form.schema.enum.map(
      (
        item: string | number | readonly string[] | undefined,
        idx: React.Key | null | undefined
      ) => (
        // eslint-disable-next-line react/no-array-index-key
        <option key={idx} value={item}>
          {getLabel(item)}
        </option>
      )
    );
  } else {
    menuItems = form.titleMap.map(
      (
        item: {
          name: string;
          value: string | number | readonly string[] | undefined;
        },
        idx: React.Key | null | undefined
      ) => (
        // eslint-disable-next-line react/no-array-index-key
        <option key={idx} value={item.value}>
          {getLabel(item)}
        </option>
      )
    );
  }

  return (
    <div {...form.otherProps}>
      <label required={form.required} {...form.labelProps}>
        {form.title}
      </label>
      <select
        defaultValue={currentValue}
        placeholder={form.placeholder}
        disabled={form?.readonly}
        onChange={onSelected}
        {...form.selectProps}
      >
        {menuItems}
      </select>
      <p {...form.helperTextProps}>{error || form.description}</p>
    </div>
  );
};

export default ComposedComponent(Select);
