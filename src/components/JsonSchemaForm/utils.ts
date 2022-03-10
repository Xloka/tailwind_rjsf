import isObject from "lodash/isObject";
import cloneDeep from "lodash/cloneDeep";
import extend from "lodash/extend";
import isUndefined from "lodash/isUndefined";
import ObjectPath from "objectpath";
import tv4 from "tv4";
import notevil from "notevil";
type Options = {
  path?: any;
  lookup: { [x: string]: any };
  global?: any;
  required?: any;
};
type Schema = {
  type: string;
  title: any;
  description: any;
  maxLength: any;
  minLength: any;
  readOnly: any;
  readonly: any;
  minimum: any;
  exclusiveMinimum: any;
  maximum: number;
  exclusiveMaximum: any;
  validationMessage: any;
  enumNames: any;
  enum: any;
  isObject: any;
  items: any;
  properties: { [x: string]: any };
  required: any;
};

// Evaluates an expression in a safe way
const safeEval = (condition: any, scope: any) => {
  try {
    const scopeSafe = cloneDeep(scope);
    return notevil(condition, scopeSafe);
  } catch (error) {
    return undefined;
  }
};

const stripNullType = (type: string | any[]) => {
  if (Array.isArray(type) && type.length === 2) {
    if (type[0] === "null") return type[1];
    if (type[1] === "null") return type[0];
  }
  return type;
};

// Creates an default titleMap list from an enum, i.e. a list of strings.
const enumToTitleMap = (enm: any[]) => {
  const titleMap: { name: string; value: string }[] = []; // canonical titleMap format is a list.
  enm.forEach((name: any) => {
    titleMap.push({ name, value: name });
  });
  return titleMap;
};

// Takes a titleMap in either object or list format and returns one in
// in the list format.
const canonicalTitleMap = (titleMap: any, originalEnum: any[]) => {
  if (!originalEnum) return titleMap;

  const canonical: { name: any; value: any }[] = [];
  const enumValues =
    Object.keys(titleMap).length === 0 ? originalEnum : titleMap;
  originalEnum.forEach((value: any, idx: string | number) => {
    canonical.push({ name: enumValues[idx], value });
  });
  return canonical;
};

// Creates a form object with all common properties
const stdFormObj = (name: any, schema: Schema, options: Options) => {
  options = options || {lookup: {}};
  const f =
    options.global && options.global.formDefaults
      ? cloneDeep(options.global.formDefaults)
      : {};
  if (options.global && options.global.supressPropertyTitles === true) {
    f.title = schema.title;
  } else {
    f.title = schema.title || name;
  }
  if (schema.description) {
    f.description = schema.description;
  }
  if (options.required === true || schema.required === true) {
    f.required = true;
  }
  if (schema.maxLength) {
    f.maxlength = schema.maxLength;
  }
  if (schema.minLength) {
    f.minlength = schema.minLength;
  }
  if (schema.readOnly || schema.readonly) {
    f.readonly = true;
  }
  if (schema.minimum) {
    f.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0);
  }
  if (schema.maximum) {
    f.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0);
  }
  // Non standard attributes (DONT USE DEPRECATED)
  // If you must set stuff like this in the schema use the x-schema-form attribute
  if (schema.validationMessage) {
    f.validationMessage = schema.validationMessage;
  }
  if (schema.enumNames) {
    f.titleMap = canonicalTitleMap(schema.enumNames, schema.enum);
  }
  f.schema = schema;

  return f;
};

const tBoolean = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "tBoolean" && !schema.enum) {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "tBoolean";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const text = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "string" && !schema.enum) {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "text";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

// default in json form for number and integer is a text field
// input type="number" would be more suitable don't ya think?
const number = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "number") {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "number";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const integer = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "integer") {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "number";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const date = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "date") {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "date";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const checkbox = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "boolean") {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "checkbox";
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const select = (name: any, schema: Schema, options: Options) => {
  if (stripNullType(schema.type) === "string" && schema.enum) {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "select";
    if (!f.titleMap && !schema.isObject) {
      f.titleMap = enumToTitleMap(schema.enum);
    }
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const removeEmpty = (obj: {
  [key: string]: any;
}) =>
  Object.entries(obj).forEach(([key, val]) => {
    if (val && typeof val === "object") removeEmpty(val);
    // eslint-disable-next-line no-param-reassign
    else if (val === undefined || val === null || val === "") delete obj[key];
  });

const checkboxes = (name: any, schema: Schema, options: Options) => {
  if (
    stripNullType(schema.type) === "array" &&
    schema.items &&
    schema.items.enum
  ) {
    const f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = "checkboxes";
    if (!f.titleMap) {
      f.titleMap = enumToTitleMap(schema.items.enum);
    }
    options.lookup[ObjectPath.stringify(options.path)] = f;
    return f;
  }
  return undefined;
};

const defaultFormDefinition = (
  name: string,
  schema: Schema,
  options: { path: any; required: any; lookup: any; ignore: any; global: any }
) => {
  // eslint-disable-next-line no-use-before-define
  const rules = defaults[stripNullType(schema.type)];
  if (rules) {
    let def: { schema: { [x: string]: any } };
    for (let i = 0; i < rules.length; i += 1) {
      def = rules[i](name, schema, options);

      // first handler in list that actually returns something is our handler!
      if (def) {
        // Do we have form defaults in the schema under the x-schema-form-attribute?
        if (
          def.schema["x-schema-form"] &&
          isObject(def.schema["x-schema-form"])
        ) {
          def = extend(def, def.schema["x-schema-form"]);
        }
        return def;
      }
    }
  }
  return undefined;
};

const fieldset = (
  name: any,
  schema: Schema,
  options: {
    lookup: { [x: string]: any };
    path: any[];
    ignore: { [x: string]: boolean };
    global: any;
  }
) => {
  if (stripNullType(schema.type) === "object") {
    const f = stdFormObj(name, schema, options);
    f.type = "fieldset";
    f.items = [];
    options.lookup[ObjectPath.stringify(options.path)] = f;

    // recurse down into properties
    if (schema.properties) {
      Object.keys(schema.properties).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
          const path = options.path.slice();
          path.push(key);
          if (options.ignore[ObjectPath.stringify(path)] !== true) {
            const required =
              schema.required && schema.required.indexOf(key) !== -1;

            const def = defaultFormDefinition(key, schema.properties[key], {
              path,
              required: required || false,
              lookup: options.lookup,
              ignore: options.ignore,
              global: options.global,
            });
            if (def) {
              f.items.push(def);
            }
          }
        }
      });
    }
    return f;
  }
  return undefined;
};

const tuple = (
  name: any,
  schema: Schema,
  options: {
    path: any[];
    lookup: { [x: string]: any };
    ignore: any;
    global: any;
  }
) => {
  if (stripNullType(schema.type) === "array") {
    const f = stdFormObj(name, schema, options);
    f.type = "tuple";
    f.key = options.path;
    options.lookup[ObjectPath.stringify(options.path)] = f;

    if (Array.isArray(schema.items)) {
      const required =
        schema.required &&
        schema.required.indexOf(options.path[options.path.length - 1]);

      f.items = schema.items.reduce((items: any[], item: any, index: any) => {
        const arrPath = options.path.slice();
        arrPath.push(index);

        const def = defaultFormDefinition(name, item, {
          path: arrPath,
          required: required || false,
          lookup: options.lookup,
          ignore: options.ignore,
          global: options.global,
        });
        if (def) {
          items.push(def);
        }

        return items;
      }, []);

      return f;
    }
  }
  return undefined;
};

const array = (
  name: any,
  schema: Schema,
  options: {
    path: any[];
    lookup: { [x: string]: any };
    ignore: any;
    global: any;
  }
) => {
  if (stripNullType(schema.type) === "array") {
    const f = stdFormObj(name, schema, options);
    f.type = "array";
    f.key = options.path;
    options.lookup[ObjectPath.stringify(options.path)] = f;

    // don't do anything if items is not defined.
    if (typeof schema.items !== "undefined") {
      const required =
        schema.required &&
        schema.required.indexOf(options.path[options.path.length - 1]) !== -1;

      // The default is to always just create one child. This works since if the
      // schemas items declaration is of type: "object" then we get a fieldset.
      // We also follow json form notatation, adding empty brackets "[]" to
      // signify arrays.

      const arrPath = options.path.slice();
      arrPath.push("");
      const def = defaultFormDefinition(name, schema.items, {
        path: arrPath,
        required: required || false,
        lookup: options.lookup,
        ignore: options.ignore,
        global: options.global,
      });
      if (def) {
        f.items = [def];
      } else {
        // This is the case that item only contains key value pair for rc-select multipel
        f.items = schema.items;
      }
    }
    return f;
  }
  return undefined;
};

const defaults:{
  [x: string]: any;
} = {
  string: [select, text],
  object: [fieldset],
  number: [number],
  integer: [integer],
  boolean: [checkbox],
  array: [checkboxes, tuple, array],
  date: [date],
  tBoolean: [tBoolean],
};

const getDefaults = (
  schema: Schema,
  ignore: { [x: string]: boolean },
  globalOptions: {}
): {
  form: any;
  lookup: { [x: string]: any };
}  => {
  const form: any[] = [];
  const lookup = {}; // Map path => form obj for fast lookup in merging
  ignore = ignore || {};
  globalOptions = globalOptions || {};
  if (stripNullType(schema.type) === "object") {
    if (schema.properties) {
      Object.keys(schema.properties).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
          if (ignore[key] !== true) {
            const required =
              schema.required && schema.required.indexOf(key) !== -1;
            const def = defaultFormDefinition(key, schema.properties[key], {
              path: [key], // Path to this property in bracket notation.
              lookup, // Extra map to register with. Optimization for merger.
              ignore, // The ignore list of paths (sans root level name)
              required, // Is it required? (v4 json schema style)
              global: globalOptions, // Global options, including form defaults
            });
            if (def) {
              form.push(def);
            }
          }
        }
      });
    }
  } else {
    throw new Error(
      'Not implemented. Only type "object" allowed at root level of schema.'
    );
  }
  return { form, lookup };
};

const postProcessFn = (form: any) => form;

/**
 * Append default form rule
 * @param {string}   type json schema type
 * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
 *                        definition or undefined
 */
const appendRule = (type: string | number, rule: any) => {
  if (!defaults[type]) {
    defaults[type] = [];
  }
  defaults[type].push(rule);
};
/**
 * Prepend default form rule
 * @param {string}   type json schema type
 * @param {Function} rule a function(propertyName,propertySchema,options) that returns a form
 *                        definition or undefined
 */
const prependRule = (type: string | number, rule: any) => {
  if (!defaults[type]) {
    defaults[type] = [];
  }
  defaults[type].unshift(rule);
};

// Utility functions
/**
 * Traverse a schema, applying a function(schema,path) on every sub schema
 * i.e. every property of an object.
 */
const traverseSchema = (
  schema: any,
  fn: any,
  path: any[],
  ignoreArrays: any
) => {
  ignoreArrays = typeof ignoreArrays !== "undefined" ? ignoreArrays : true;

  path = path || [];

  const traverse = (
    innerSchema: { properties: { [x: string]: any }; items: any },
    innerFunc: (arg0: any, arg1: any) => void,
    innerPath: any[]
  ) => {
    innerFunc(innerSchema, innerPath);
    if (innerSchema.properties) {
      Object.keys(innerSchema.properties).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(innerSchema.properties, key)) {
          const currentPath = innerPath.slice();
          currentPath.push(key);
          traverse(innerSchema.properties[key], innerFunc, currentPath);
        }
      });
    }
    // Only support type "array" which have a schema as "items".
    if (!ignoreArrays && innerSchema.items) {
      const arrPath = innerPath.slice();
      arrPath.push("");
      traverse(innerSchema.items, innerFunc, arrPath);
    }
  };

  traverse(schema, fn, path || []);
};

const traverseForm = (
  form: { items: any[]; tabs: any[] },
  fn: (arg0: any) => void
) => {
  fn(form);
  if (form.items) {
    form.items.forEach((f: any) => {
      traverseForm(f, fn);
    });
  }

  if (form.tabs) {
    form.tabs.forEach((tab: { items: any[] }) => {
      tab.items.forEach((f: any) => {
        traverseForm(f, fn);
      });
    });
  }
};

const merge = (
  schema: Schema,
  form: string[],
  ignore: any,
  options: {},
  readonly: boolean
) => {
  form = form || ["*"];
  options = options || {};

  // Get readonly from root object
  readonly = readonly || schema.readonly || schema.readOnly;

  const stdForm = getDefaults(schema, ignore, options);
  // simple case, we have a "*", just put the stdForm there
  const idx = form.indexOf("*");
  if (idx !== -1) {
    form = form
      .slice(0, idx)
      .concat(stdForm.form)
      .concat(form.slice(idx + 1));
  }

  // ok let's merge!
  // We look at the supplied form and extend it with schema standards
  const { lookup } = stdForm;
  return postProcessFn(
    form.map((obj: any) => {
      // handle the shortcut with just a name
      if (typeof obj === "string") {
        obj = { key: obj };
      }
      if (obj && obj.key) {
        if (typeof obj.key === "string") {
          obj.key = ObjectPath.parse(obj.key);
        }
      }

      if (obj && obj.itemForm) {
        obj.items = [];
        const str = ObjectPath.stringify(obj.key);
        const foundForm = lookup[str];
        foundForm.items.forEach((item: { key: any }) => {
          const o = cloneDeep(obj.itemForm);
          o.key = item.key;
          obj.items.push(o);
        });
      }

      // extend with std form from schema.
      if (obj && obj.key) {
        const strid = ObjectPath.stringify(obj.key);
        if (lookup[strid]) {
          const schemaDefaults = lookup[strid];
          Object.keys(schemaDefaults).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(schemaDefaults, key)) {
              if (obj[key] === undefined) {
                obj[key] = schemaDefaults[key];
              }
            }
          });
        }
      }

      // Are we inheriting readonly?
      if (readonly === true) {
        // Inheriting false is not cool.
        obj.readonly = true;
      }

      // if it's a type with items, merge 'em!
      if (obj && obj.items && obj.items.length > 0) {
        obj.items = merge(schema, obj.items, ignore, options, obj.readonly);
      }

      // if its has tabs, merge them also!
      if (obj && obj.tabs) {
        obj.tabs.forEach((tab: { items: any }) => {
          tab.items = merge(schema, tab.items, ignore, options, obj.readonly);
        });
      }

      // Special case: checkbox
      // Since have to ternary state we need a default
      if (obj && obj.type === "checkbox" && isUndefined(obj.schema.default)) {
        obj.schema.default = false;
      }

      return obj;
    })
  );
};

function selectOrSet(
  projection: any,
  obj: { [x: string]: any },
  valueToSet?: any,
  type?: string
) {
  const numRe = /^\d+$/;

  if (!obj) {
    obj = {};
  }
  // Support [] array syntax
  const parts =
    typeof projection === "string" ? ObjectPath.parse(projection) : projection;

  if (typeof valueToSet !== "undefined" && parts.length === 1) {
    // special case, just setting one variable
    obj[parts[0]] = valueToSet;
    return obj;
  }

  if (
    typeof valueToSet !== "undefined" &&
    typeof obj[parts[0]] === "undefined"
  ) {
    // We need to look ahead to check if array is appropriate
    obj[parts[0]] = parts.length >= 2 && numRe.test(parts[1]) ? [] : {};
  }

  if (
    typeof type !== "undefined" &&
    ["number", "integer"].indexOf(type) > -1 &&
    typeof valueToSet === "undefined"
  ) {
    // number or integer can undefined
    obj[parts[0]] = valueToSet;
    return obj;
  }

  let value = obj[parts[0]];
  for (let i = 1; i < parts.length; i += 1) {
    // Special case: We allow JSON Form syntax for arrays using empty brackets
    // These will of course not work here so we exit if they are found.
    if (parts[i] === "") {
      return undefined;
    }
    if (typeof valueToSet !== "undefined") {
      if (i === parts.length - 1) {
        // last step. Let's set the value
        value[parts[i]] = valueToSet;
        return valueToSet;
      }
      // Make sure to create new objects on the way if they are not there.
      // We need to look ahead to check if array is appropriate
      let tmp = value[parts[i]];
      if (typeof tmp === "undefined" || tmp === null) {
        tmp = numRe.test(parts[i + 1]) ? [] : {};
        value[parts[i]] = tmp;
      }
      value = tmp;
    } else if (value) {
      // Just get nex value.
      value = value[parts[i]];
    }
  }
  return value;
}

const validateBySchema = (schema: any, value: any) =>
  tv4.validateResult(value, schema);

const validate = (
  form: {
    type?: any;
    key?: any;
    required?: any;
    validationMessage?: any;
    schema?: any;
  },
  value: any
) => {
  if (!form) {
    return { valid: true };
  }
  const { schema } = form;
  if (!schema) {
    return { valid: true };
  }
  // Input of type text and textareas will give us a viewValue of ''
  // when empty, this is a valid value in a schema and does not count as something
  // that breaks validation of 'required'. But for our own sanity an empty field should
  // not validate if it's required.

  if (value === "") {
    value = undefined;
  }

  // Numbers fields will give a null value, which also means empty field
  if (form.type === "number" && value === null) {
    value = undefined;
  }

  if (form.type === "number" && Number.isNaN(parseFloat(value))) {
    value = undefined;
  }

  // Version 4 of JSON Schema has the required property not on the
  // property itself but on the wrapping object. Since we like to test
  // only this property we wrap it in a fake object.
  const wrap:{
    type: any;
    required?: any;
    properties: any;
  } = { type: "object", properties: {}, required: [] };
  const propName = form.key[form.key.length - 1];
  wrap.properties[propName] = schema;

  if (form.required) {
    wrap.required = [propName];
  }
  const valueWrap:{
    [x: string]: any;
  } = {};
  if (typeof value !== "undefined") {
    valueWrap[propName] = value;
  }

  const tv4Result = tv4.validateResult(valueWrap, wrap);
  if (
    tv4Result != null &&
    !tv4Result.valid &&
    form.validationMessage != null &&
    typeof value !== "undefined"
  ) {
    tv4Result.error.message = form.validationMessage;
  }
  return tv4Result;
};

const getValueFromModel = (
  model: { [x: string]: any },
  key: string | number | any[]
) => {
  let result: any;
  if (Array.isArray(key)) {
    key.reduce((cur, nxt) => cur && cur[nxt], model);
    result = key.reduce((cur, nxt) => cur && cur[nxt], model);
  } else {
    result = model[key];
  }
  return result;
};

const getTitleByValue = (titleMap: string | any[], value: any) => {
  for (let i = 0; i < titleMap.length; i += 1) {
    const item = titleMap[i];
    if (item.value === value) return item.name;
  }
  return undefined;
};

export default {
  traverseForm,
  traverseSchema,
  prependRule,
  appendRule,
  postProcessFn,
  getDefaults,
  defaultFormDefinition,
  defaults,
  array,
  fieldset,
  checkboxes,
  select,
  checkbox,
  integer,
  number,
  text,
  stdFormObj,
  canonicalTitleMap,
  enumToTitleMap,
  stripNullType,
  merge,
  validate,
  validateBySchema,
  safeEval,
  selectOrSet,
  getValueFromModel,
  getTitleByValue,
  removeEmpty,
};
