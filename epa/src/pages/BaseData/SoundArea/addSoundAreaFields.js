// src/pages/base-data/sound-area/addSoundAreaFields.js

const addSoundAreaFields = [
  {
    name: "name",
    label: "Sound Area Name",
    type: "text",
    placeholder: "Enter sound area name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
    rows: 4,
    required: false,
  },
];

export default addSoundAreaFields;
