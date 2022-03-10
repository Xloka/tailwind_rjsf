import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import JsonSchemaForm from ".";

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
export default {
    title: "JsonSchemaForm",
    component: JsonSchemaForm,
} as unknown as ComponentStory<typeof JsonSchemaForm>;

const Template: ComponentStory<typeof JsonSchemaForm> = (args: Props) => ( <
    JsonSchemaForm {...args}
    />
);



export const Simple = Template.bind({
    onModelChange:() => {},
        model:{},
        form:[
          "name",
          "email",
          "environment",
          {
            key: "comment",
            type: "textarea",
            placeholder: "Make a comment",
          },
        ],
        schema:{
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
              validationMessage:
                "Email must be of proper format: example@example",
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
});
