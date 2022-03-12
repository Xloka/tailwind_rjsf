import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import JsonSchemaForm from ".";
import { Props } from "../../type";

export default {
  title: "JsonSchemaForm",
  component: JsonSchemaForm,
} as unknown as ComponentStory<typeof JsonSchemaForm>;

const Template: ComponentStory<typeof JsonSchemaForm> = (args: Props) => (
  <JsonSchemaForm {...args} />
);

export const Default = Template.bind({});
Default.args = {
  onModelChange: () => {},
  model: {},
  form: [
    "name",
    "email",
    "environment",
    {
      key: "comment",
      type: "textarea",
      placeholder: "Make a comment",
    },
  ],
  schema: {
    type: "object",
    title: "Comment",
    properties: {
      name: {
        title: "Name",
        type: "string",
        default: "Steve",
      },
      email: {
        title: "Email",
        type: "string",
        pattern: "^\\S+@\\S+$",
        validationMessage: "Email must be of proper format: example@example",
        description: "Email will be used for evil.",
      },
      environment: {
        type: "string",
        title: "Environment",
        enum: ["LOCAL", "SIT1", "SIT2", "SIT3", "UAT1", "UAT2"],
      },
      comment: {
        title: "Comment",
        type: "string",
        maxLength: 20,
        validationMessage: "Don't be greedy! 20 Characters max please :)",
        description: "Please write your comment here.",
      },
    },
    required: ["name", "email", "comment"],
  },
};
export const Tailwind = Template.bind({});
Tailwind.args = {
  
  className: "flex flex-col",
  onModelChange: () => {},
  model: {},
  form: [
    "name",
    "email",
    "environment",
    {
      key: "comment",
      type: "textarea",
      placeholder: "Make a comment",
    },
  ],
  schema: {
    type: "object",
    title: "Comment",
    properties: {
      name: {
        title: "Name",
        type: "string",
        default: "Steve",
      },
      email: {
        title: "Email",
        type: "string",
        pattern: "^\\S+@\\S+$",
        validationMessage: "Email must be of proper format: example@example",
        description: "Email will be used for evil.",
      },
      environment: {
        type: "string",
        title: "Environment",
        enum: ["LOCAL", "SIT1", "SIT2", "SIT3", "UAT1", "UAT2"],
      },
      comment: {
        title: "Comment",
        type: "string",
        maxLength: 20,
        validationMessage: "Don't be greedy! 20 Characters max please :)",
        description: "Please write your comment here.",
      },
    },
    required: ["name", "email", "comment"],
  },};
