// src/pages/base-data/form-type/FormTypesList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { ArrowLeft, Plus } from "lucide-react";

// Service
import FormTypeService from "../../../services/formType.service.js";

// Form Config
import addFormTypeFields from "./addFormTypeFields.js";
import addFormTypeSchema from "./addFormTypeSchema.js";
import FilterTab from "../../../components/Form/FilterTab.jsx";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Form Type", accessor: "form_type" },
  { Header: "Description", accessor: "description" },
];

export default function FormTypesList({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({ form_type: "", description: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const fetchFormTypes = async () => {
    const result = await FormTypeService.getAllFormTypes();
    if (result) setItems(result);
  };

  useEffect(() => {
    fetchFormTypes();
  }, []);

  const handleFormChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setForm({ form_type: "", description: "" });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedItem(row);
    setForm({
      form_type: row.form_type || "",
      description: row.description || "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ form_type: "", description: "" });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = addFormTypeSchema.safeParse(form);
    if (!validation.success) {
      setToast({ open: true, message: "Please fix form errors", type: "error" });
      return;
    }

    try {
      let success;
      if (isEditing && selectedItem) {
        success = await FormTypeService.updateFormType(selectedItem.form_type_id, form);
      } else {
        success = await FormTypeService.createFormType(form);
      }

      if (success) {
        await fetchFormTypes();
        closeModal();
        setToast({
          open: true,
          message: isEditing ? "Updated successfully" : "Created successfully",
          type: "success",
        });
      }
    } catch {
      setToast({ open: true, message: "Operation failed", type: "error" });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.form_type_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;

    const success = await FormTypeService.deleteFormType(toDeleteId);

    setToast({
      open: true,
      message: success ? "Deleted successfully" : "Delete failed",
      type: success ? "success" : "error",
    });

    if (success) await fetchFormTypes();

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  // ➜ Only Edit & Delete (View removed)
  const actions = {
    onEdit: openEditModal,
    onDelete: handleDelete,
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;

    return items.filter(
      (item) =>
        item.form_type?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [query, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
  const rowsWithId = sliced.map((row, idx) => ({
    ...row,
    displayId: (page - 1) * pageSize + idx + 1,
  }));

  return (
    <>
      <div className="">
        {/* Page Title */}
        <div className="flex gap-2 items center mb-2 ">

          <Button color="green"
            onClick={() => window.history.back()}
            className="rounded-full w-10 h-10 "
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Form Types</h1>
        </div>
        {/* Tabs + Search + Add */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Tabs */}
          <div className="flex-1">
            <FilterTab
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { key: "reportTypes", label: "Report Types" },
                { key: "formTypes", label: "Form Types" },
                { key: "reportingForms", label: "Reporting Forms" },
              ]}
            />
          </div>

          {/* Right: Search + Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search form types..."
              className="w-full lg:w-64"
            />

            <Button color="green" onClick={openAddModal} className="whitespace-nowrap">
              <Plus size={20} />
              <span className="hidden md:inline ml-2">Add Form Type</span>
            </Button>
          </div>
        </div>

      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No form types found.</p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rowsWithId}
            actions={actions}
            isonviewdetails={true}
          />
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Form Type" : "Add Form Type"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <DynamicForm
          fields={addFormTypeFields}
          values={form}
          onChange={handleFormChange}
          schema={addFormTypeSchema}
          submitAttempted={submitAttempted}
        />
      </Modal>

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <Confirmation
        open={confirmOpen}
        title="Delete Form Type"
        message="Are you sure you want to delete this Form Type?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
