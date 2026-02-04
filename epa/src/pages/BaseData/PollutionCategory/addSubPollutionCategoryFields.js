const addSubPollutionCategoryFields = [
  {
    name: "sub_pollution_category",
    label: "Sub-Pollution Category",
    type: "text",
    placeholder: "Enter sub-pollution category name",
    required: true,
    grid: "col-span-6",
  },
  {
    name: "investigation_days",
    label: "Investigation Days",
    type: "number",
    placeholder: "Enter investigation days",
    required: true,
    grid: "col-span-6",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description (optional)",
    required: false,
    grid: "col-span-6",
  },
];

export default addSubPollutionCategoryFields;
