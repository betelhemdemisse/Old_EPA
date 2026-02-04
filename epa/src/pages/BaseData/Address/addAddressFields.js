// addAddressFields.js

export default [
  {
    name: "name",
    label: "Office Name",
    type: "text",
    placeholder: "Enter office name",
    required: true,
  },
  {
    name: "latitude",
    label: "Latitude",
    type: "text",
    placeholder: "Enter latitude",
    required: true,
  },
  {
    name: "longitude",
    label: "Longitude",
    type: "text",
    placeholder: "Enter longitude",
    required: true,
  },
  {
    name: "phone_number",
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
    required: false,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    required: false,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
    required: false,
  },
];
