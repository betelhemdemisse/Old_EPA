// addUserFields.js

export default function getAddUserFields() {
  return [
    { 
      name: 'fullName', 
      label: 'Full Name', 
      type: 'text', 
      isRequired:true,
      placeholder: "Enter full name", 
      grid: 'col-span-3 mr-6' 
    },

    { 
      name: 'email', 
      label: 'Email Address', 
      type: 'email', 
      isRequired:true,
      placeholder: "email@domain.com", 
      grid: 'col-span-3' 
    },

   {
  name: 'role',
  label: 'Role',
  type: 'select',
  isRequired:true,
  placeholder: "Select role(s)",
  grid: 'col-span-3 mr-6',
  options: [],
  multiple: true, // ✅ ADD THIS
},

    { 
      name: 'pollution_category', 
      label: 'Pollution Category', 
      type: 'select', 
      placeholder: "select pollution category", 
      grid: 'col-span-3', 
      options: [] 
    },

    { 
      name: 'sub_pollution_category', 
      label: 'Subpollution Category', 
      type: 'select', 
      placeholder: "select subpollution category", 
      grid: 'col-span-3 mr-6', 
      options: [] 
    },

    {
      name: 'organizationHierarchy',
      label: 'Hierarchy',
      isRequired:true,
      type: 'select',
      placeholder: 'Select hierarchy...',
      grid: 'col-span-3 mr-6',
      options: [],
    }
  ];
}
