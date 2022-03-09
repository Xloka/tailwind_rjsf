import React from "react";

export interface IJsonSchemaFormProps {
    schema: any;
    form: any;
    model: any;
    onChange: (value: any) => void;
    onSubmit: (value: any) => void;
    onError: (error: any) => void;
}

const JsonSchemaForm: React.FC<IJsonSchemaFormProps> = (props) => {
    return (
        <div>
            <h1>JsonSchemaForm</h1>
        </div>
    );
}

export default JsonSchemaForm;