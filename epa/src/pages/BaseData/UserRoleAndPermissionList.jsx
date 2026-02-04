import { useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import DynamicForm from "../../components/Form/DynamicForm.jsx";
import addRoleAndPermissionFields from "./addRoleAndPermissionFields.js";
import addRolsAndPermissionsSchema from "./addRoleAndPermissionSchema.js";
import { Import, Plus } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../components/Alerts/Confirmation.jsx";

// Mock Data
const RoleAndPermissions = [
  { id: "1", role: "System Administrator", permission: "All Access" },
  { id: "2", role: "Case Manager", permission: "Edit Content" },
  { id: "3", role: "Stakeholder Officer", permission: "View Content" },
  { id: "4",  role: "Public User", permission: "Contribute Content" },
];

//  Table Columns 
 const defaultUserColumns = [
  { Header: " No", accessor: "id" },
  { Header: "Role", accessor: "role" },
  { Header: "Permission", accessor: "permission" },
  
 
];

export default function UserRoleAndPermissionList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [rolsAndPermissions, setrolsAndPermissions] = useState(RoleAndPermissions);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);



  const handleFormChange = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const handleAddRoleAndPermission = () => { setSubmitAttempted(false); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setForm({}); };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const res = addRolsAndPermissionsSchema.safeParse(form);
    if (!res.success) {
      
      return;
    }

    // create a minimal user object and add to list (mock behavior)
    const newUserRoleAndPermissions = {
      id: String(rolsAndPermissions.length + 1).padStart(1, '0'),
      role: form.role || 'User',
      description: form.description || '',
      permission: form.permission || '',
    
    };
    setrolsAndPermissions((u) => [newUserRoleAndPermissions, ...u]);
    setModalOpen(false);
    setForm({});
    setSubmitAttempted(false);
    setToast({ open: true, message: 'User added successfully', type: 'success' });
  };

  // Filtering logic
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rolsAndPermissions;
    return rolsAndPermissions.filter(
      (u) =>
        u.role.toLowerCase().includes(q) ||
        u.permission.toLowerCase().includes(q) 
       
    );
  }, [query, rolsAndPermissions]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const actions = {
    onEdit: (row) => alert(`Edit ${row.fullName}`),
    onView: (row) => alert(`View ${row.fullName}`),
    onDelete: (row) => {
      // open confirmation modal
      setToDeleteId(row.id);
      setConfirmOpen(true);
    },
  };

  const handleConfirmDelete = () => {
    if (!toDeleteId) return setConfirmOpen(false);
    setrolsAndPermissions((u) => u.filter((x) => x.id !== toDeleteId));
    setConfirmOpen(false);
    setToDeleteId(null);
    setToast({ open: true, message: 'User deleted', type: 'success' });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Role Management</h1>
            <p className="text-sm text-gray-500">
              This is the Role And Permisssion management of the Super professional EPA system.
            </p>
          </div>
           
          <div className="flex  items-center gap-2" >
             <div className="flex-1 hidden md:flex  items-center justify-between gap-3 ">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search...."
          />
        </div>
            <Button color="green" onClick={handleAddRoleAndPermission} >
             <Plus/>
            <span className="hidden md:flex">  Add Role</span>
            </Button>
            <Button  color="green">
              <Import/>
             <span className="hidden md:flex" >Import</span> 
            </Button>
          <Button color="blue">
            <Import className="rotate-180 " />
           <span className="hidden md:flex">Export</span> 
          </Button>
          </div>
        </div>
       
        <div className="mt-4">
          <Table isFromBasedata={false} columns={defaultUserColumns} rows={slice} actions={actions} />
        </div>
        <Modal
          open={modalOpen}
          onClose={handleModalClose}
          title="Add Role"
          description="Fill in the details to add users role."
          actions={[
            <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose}>Cancel</Button>,
            <Button key="save" color="green" onClick={handleFormSubmit}>Save</Button>,
          ]}
        >
          <DynamicForm fields={addRoleAndPermissionFields} values={form} onChange={handleFormChange} schema={addRolsAndPermissionsSchema} submitAttempted={submitAttempted} />
        </Modal>
        <div className="mt-3">
          <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
        </div>
        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />

        <Confirmation
          open={confirmOpen}
          title="Delete user"
          message="This action cannot be undone. Are you sure you want to delete this user?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
