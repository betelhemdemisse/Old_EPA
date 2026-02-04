// teamAssignFields.js
export const teamAssignFields = [
  {
    name: "department",
    label: "Department",
    type: "select",
    placeholder: "Select department",
    options: [
      { value: "dep1", label: "Water Pollution Dept" },
      { value: "dep2", label: "Air Quality Dept" },
      { value: "dep3", label: "Waste Management Dept" },
    ],
  },
  

  {
    name: "expert",
    label: "Assign Experts",
    type: "select",
    placeholder: "Select experts",
    options: [
      { value: "exp1", label: "Expert One" },
      { value: "exp2", label: "Expert Two" },
      { value: "exp3", label: "Expert Three" },
    ],
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Write additional notes...",
  },
];
