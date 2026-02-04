// Field config for Add User modal
const addUserFields = [
  { name: 'fullName', label: 'Full Name', type: 'text', placeholder:"Enter full name",  grid: 'col-span-6' },
  { name: 'email', label: 'Email Address', type: 'email' , placeholder:"email@domain.com",  grid: 'col-span-6' },
  { name: 'role', label: 'Role', type: 'select', placeholder:"Enter Role",  grid: 'col-span-6 ' , options: [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
  ] },
  { name: 'institution', label: 'Institution', type: 'select',  placeholder:"Enter Inistitution...",  grid: 'col-span-6 sm:col-span-3' ,options: [
    { value: 'xyz', label: 'XYZ' },
    { value: 'abc', label: 'ABC' },
  ] },
  { name: 'department', label: 'Department', type: 'select', placeholder:"Enter Departement...",  grid: 'col-span-6 sm:col-span-3' , options: [
    { value: 'dep1', label: 'Dep 1' },
    { value: 'dep2', label: 'Dep 2' },
  ] },
  { name: 'region', label: 'Region', type: 'select', placeholder:"Enter Region... ",  grid: 'col-span-6 sm:col-span-2' , options: [
    { value: 'addis', label: 'Addis Ababa' },
    { value: 'diredawa', label: 'Dire Dawa' },
  ] },
  { name: 'zone', label: 'Zone', type: 'select', placeholder:"Enter zone...",  grid: 'col-span-6 sm:col-span-2' , options: [
    { value: 'm', label: 'M' },
    { value: 'n', label: 'N' },
  ] },
  { name: 'woreda', label: 'Woreda', type: 'select', placeholder:"Enter woreda...",  grid: 'col-span-6 sm:col-span-2' , options: [
    { value: 'type1', label: 'Type 1' },
    { value: 'type2', label: 'Type 2' },
  ] },
];

export default addUserFields;
