// src/pages/base-data/rejection-reason/RejectionReasonList.jsx
import { useEffect, useMemo, useState } from "react";
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
import RejectionReasonService from "../../../services/RejectionReason.service.js";

// Form Config
import addRejectionReasonFields from "./addRejectionReasonFields.js";
import addRejectionReasonSchema from "./addRejectionReasonSchema.js";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Reason", accessor: "reason" },
  { Header: "Description", accessor: "description" },
];

export default function RejectionReasonList() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({ reason: "", description: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  /* ---------------- Fetch ---------------- */
  const fetchRejectionReasons = async () => {
    const data = await RejectionReasonService.getAllRejectionReasons();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchRejectionReasons();
  }, []);

  /* ---------------- Form ---------------- */
  const handleFormChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setForm({ reason: "", description: "" });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedItem(row);
    setForm({
      reason: row.reason || "",
      description: row.description || "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ reason: "", description: "" });
    setIsEditing(false);
    setSelectedItem(null);
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = addRejectionReasonSchema.safeParse(form);
    if (!validation.success) {
      setToast({ open: true, message: "Please fix form errors", type: "error" });
      return;
    }

    let result;
    if (isEditing && selectedItem) {
      result = await RejectionReasonService.updateRejectionReason(
        selectedItem.rejection_reason_id,
        form
      );
    } else {
      result = await RejectionReasonService.createRejectionReason(form);
    }

    if (result) {
      await fetchRejectionReasons();
      closeModal();
      setToast({
        open: true,
        message: isEditing
          ? "Rejection/Return  reason updated"
          : "Rejection/Return reason created",
        type: "success",
      });
    } else {
      setToast({ open: true, message: "Operation failed ❌", type: "error" });
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = (row) => {
    setToDeleteId(row.rejection_reason_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;

    const result = await RejectionReasonService.deleteRejectionReason(toDeleteId);

    setToast({
      open: true,
      message: result ? "Deleted successfully 🗑️" : "Delete failed",
      type: result ? "success" : "error",
    });

    if (result) await fetchRejectionReasons();

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  /* ---------------- Table ---------------- */
  const actions = {
    onEdit: openEditModal,
    onDelete: handleDelete,
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;

    return items.filter(
      (item) =>
        item.reason?.toLowerCase().includes(q) ||
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
      {/* Header */}
      <div className="mb-4">
          <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Rejection/Return Reasons
        </h1>
        </div>

        <div className="flex  md:flex-row md:items-center md:justify-between gap-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search rejection/return reasons..."
            className="flex-1"
          />

          <Button color="green" onClick={openAddModal}>
            <Plus size={20} />
            <span className="hidden md:inline ml-2">
              Add Rejection Reason
            </span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No rejection/return reasons found.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} rows={rowsWithId} actions={actions} isonviewdetails={true} />
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Rejection/Return Reason" : "Add Rejection/Return Reason"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <DynamicForm
          fields={addRejectionReasonFields}
          values={form}
          onChange={handleFormChange}
          schema={addRejectionReasonSchema}
          submitAttempted={submitAttempted}
        />
      </Modal>

      {/* Toast */}
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      />

      {/* Confirmation */}
      <Confirmation
        open={confirmOpen}
        title="Delete Rejection/Return Reason"
        message="Are you sure you want to delete this Rejection/Return reason?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
