// src/pages/base-data/rejection-reason/addRejectionReasonFields.js

const addRejectionReasonFields = [
  {
    name: "reason",
    label: "Rejection Reason",
    type: "text",
    placeholder: "Enter rejection reason",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description (optional)",
    required: false,
    rows: 4,
  },
];

export default addRejectionReasonFields;
