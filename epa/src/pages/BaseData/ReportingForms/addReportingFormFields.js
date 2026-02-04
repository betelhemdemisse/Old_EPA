// src/pages/base-data/reporting-form/addReportingFormFields.js

const addReportingFormFields = [
  {
    name: "report_form",
    label: "Form Name",
    type: "text",
    required: true,
  },

  {
    name: "input_type",
    label: "Input Type",
    type: "select",
    required: true,
    options: [
      { label: "Text", value: "text" },
      { label: "Number", value: "number" },
      { label: "Textarea", value: "textarea" },
      { label: "Select", value: "select" },
      { label: "Checkbox", value: "checkbox" },
      { label: "Radio", value: "radio" },
      { label: "Date", value: "date" },
      { label: "Time", value: "time" },
    ],
  },

  {
    name: "options",
    label: "Options",
    type: "multi-text",
    helperText: "Add multiple options",
    showWhen: ["select", "radio", "checkbox"],
  },

  {
    name: "required",
    label: "Required Field",
    type: "checkbox",
  },

  {
    name: "form_type_id",
    label: "Form Type",
    type: "select",
    required: true,
    optionsKey: "formTypes",
  },

  {
    name: "report_type_id",
    label: "Report Type",
    type: "select",
    required: true,
    optionsKey: "reportTypes",
  },
];

export default addReportingFormFields;
