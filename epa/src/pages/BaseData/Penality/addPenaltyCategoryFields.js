
export default [
  {
    name: "penalty_name",
    label: "Penalty Category Name",
    type: "text",
    placeholder: "e.g. Traffic Violation, Environmental Offense",
    required: true,
    grid: "col-span-6",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Provide a brief description of this penalty category (optional)",
    required: false,
    grid: "col-span-6",
  },
];