
export default [
  {
    name: "issue_type",
    label: "Sub-Penalty Name",
    type: "text",
    placeholder: "e.g. Speeding over 20km/h, Illegal Dumping",
    required: true,
    grid: "col-span-6",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Details, fine amount, legal reference, etc. (optional)",
    required: false,
    grid: "col-span-6",
  },
];