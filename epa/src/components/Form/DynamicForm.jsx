import { useEffect, useState } from "react";
import Input from "./Input";
import Select from "./Select";
import TextArea from "./TextArea";
import Checkbox from "./CheckBoxs";

/* ---------------- FIELD MAP ---------------- */

const FIELD_COMPONENTS = {
  text: Input,
  email: Input,
  select: Select,
  textarea: TextArea,
  checkbox: Checkbox,
  "multi-text": MultiTextInput,
};

/* ---------------- MULTI TEXT INPUT ---------------- */

function MultiTextInput({
  label,
  value = [],
  onChange,
  error,
  helperText,
}) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              value={v}
              onChange={(e) => {
                const updated = [...value];
                updated[i] = e.target.value;
                onChange(updated);
              }}
            />

            <button
              type="button"
              className="text-red-500 px-2"
              onClick={() =>
                onChange(value.filter((_, idx) => idx !== i))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-2 text-sm text-green-600"
        onClick={() => onChange([...value, ""])}
      >
        + Add option
      </button>

      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

/* ---------------- DYNAMIC FORM ---------------- */

export default function DynamicForm({
  fields,
  values = {},
  onChange,
  schema,
  submitAttempted = false,
  options = {},
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* -------- HELPER FUNCTIONS -------- */
  
  // Prepare values for validation - replace undefined with empty string
  const prepareValuesForValidation = (valuesObj) => {
    const prepared = { ...valuesObj };
    // Get all field names from the form
    const fieldNames = fields.map(f => f.name);
    
    // Ensure all fields exist in the object
    fieldNames.forEach(fieldName => {
      if (prepared[fieldName] === undefined) {
        prepared[fieldName] = "";
      }
    });
    
    return prepared;
  };

  // Safely extract error message
  const getErrorMessage = (errorValue) => {
    if (!errorValue) return undefined;
    
    if (Array.isArray(errorValue)) {
      return errorValue.length > 0 ? errorValue[0] : undefined;
    }
    
    if (typeof errorValue === 'string') {
      return errorValue;
    }
    
    return undefined;
  };

  /* -------- FIELD VALIDATION -------- */
  const validateField = (fieldName) => {
    if (!schema) return;

    const preparedValues = prepareValuesForValidation(values);
    const result = schema.safeParse(preparedValues);

    if (result.success) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    } else {
      const fieldErrors = result.error.flatten().fieldErrors || {};
      const message = getErrorMessage(fieldErrors[fieldName]);
      setErrors((prev) => ({ ...prev, [fieldName]: message }));
    }
  };

  /* -------- SUBMIT VALIDATION -------- */
  useEffect(() => {
    if (!schema || !submitAttempted) return;

    const preparedValues = prepareValuesForValidation(values);
    const result = schema.safeParse(preparedValues);

    if (result.success) {
      setErrors({});
    } else {
      const mapped = {};
      const fieldErrors = result.error.flatten().fieldErrors || {};

      Object.keys(fieldErrors).forEach((key) => {
        mapped[key] = getErrorMessage(fieldErrors[key]);
      });

      setErrors(mapped);
    }
  }, [submitAttempted, schema, values]);

  /* ---------------- RENDER ---------------- */
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-6 gap-2">
        {fields.map((field) => {
          const Component = FIELD_COMPONENTS[field.type] || Input;
          const gridClass = field.grid || "col-span-6 sm:col-span-3";

          const showError =
            (touched[field.name] || submitAttempted)
              ? errors[field.name]
              : undefined;

          /* -------- VALUE HANDLING -------- */
          let valueProp = {};
          if (field.type === "checkbox") {
            valueProp = { checked: Boolean(values[field.name]) };
          } else if (field.multiple) {
            valueProp = {
              value: Array.isArray(values[field.name])
                ? values[field.name]
                : [],
            };
          } else {
            valueProp = { value: values[field.name] ?? "" };
          }

          return (
            <div key={field.name} className={gridClass}>
              <Component
                label={field.label}
                required = {field.isRequired}
                name={field.name}
                type={
                  Component === Input &&
                  (field.type === "text" || field.type === "email")
                    ? field.type
                    : undefined
                }
                {...valueProp}
                multiple={field.multiple}
                options={
                  field.optionsKey
                    ? options[field.optionsKey]
                    : field.options
                }
                placeholder={field.placeholder}
                error={showError}
                {...field.props}
                onChange={(val) => {
                  onChange(field.name, val);
                  field.onChange?.(val);
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    [field.name]: true,
                  }));
                  validateField(field.name);
                }}
              />
            </div>
          );
        })}
      </div>
    </form>
  );
}