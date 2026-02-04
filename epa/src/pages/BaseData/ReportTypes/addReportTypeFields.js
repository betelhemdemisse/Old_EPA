const addReportTypeFields = [
  {
    name: "report_type",
    label: "Report Type",
    type: "text",
    placeholder: "Enter report type",
    required: true,
  },
  {
    name: "sub_pollution_category_id",
    label: "Sub-Pollution Category",
    type: "select",
    placeholder: "Select a sub-pollution category",
    required: true,
    options: [],
  },
];

export default addReportTypeFields;
