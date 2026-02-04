// src/pages/base-data/penalty/PenaltyCategoryDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { Plus, ArrowLeft } from "lucide-react";

import services from "../../../services/penality.service.js";
const { PenaltySubCategoryService } = services;

import addPenaltySubCategoryFields from "./addPenaltySubCategoryFields.js";
import addPenaltySubCategorySchema from "./addPenaltySubCategorySchema.js";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Sub-Penalty", accessor: "issue_type" },
  { Header: "Description", accessor: "description" },
];

export default function PenaltyCategoryDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { penalty_id, penalty_name } = state || {};

  useEffect(() => {
    if (!penalty_id) navigate("/base-data/penalty", { replace: true });
  }, [penalty_id, navigate]);

  const [subCategories, setSubCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ issue_type: "", description: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const fetchSubCategories = async () => {
    if (!penalty_id) return;
    const result = await PenaltySubCategoryService.getPenaltySubCategoriesByPenaltyId(penalty_id);
    if (result) setSubCategories(result || []);
  };

  useEffect(() => {
    fetchSubCategories();
  }, [penalty_id]);

  const handleFormChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const openAdd = () => {
    setIsEditing(false);
    setSelected(null);
    setForm({ issue_type: "", description: "" });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setIsEditing(true);
    setSelected(row);
    setForm({
      issue_type: row.issue_type || "",
      description: row.description || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ issue_type: "", description: "" });
    setIsEditing(false);
    setSelected(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = addPenaltySubCategorySchema.safeParse(form);
    if (!validation.success) {
      setToast({ open: true, message: "Please fill required fields", type: "error" });
      return;
    }

    try {
      let success = false;
      if (isEditing && selected) {
        const payload = { issue_type: form.issue_type.trim(), description: form.description.trim() || null };
        success = await PenaltySubCategoryService.updatePenaltySubCategory(selected.penalty_sub_category_id, payload);
      } else {
        const payload = {
          issue_type: form.issue_type.trim(),
          description: form.description.trim() || null,
          penalty_id: penalty_id,
        };
        success = await PenaltySubCategoryService.createPenaltySubCategory(payload);
      }

      if (success) {
        await fetchSubCategories();
        closeModal();
        setToast({ open: true, message: isEditing ? "Updated" : "Added", type: "success" });
      }
    } catch (err) {
      setToast({ open: true, message: "Server error", type: "error" });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.penalty_sub_category_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const success = await PenaltySubCategoryService.deletePenaltySubCategory(toDeleteId);
    setToast({ open: true, message: success ? "Deleted" : "Failed", type: success ? "success" : "error" });
    if (success) await fetchSubCategories();
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const actions = { onEdit: openEdit, onDelete: handleDelete };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return subCategories;
    return subCategories.filter((i) =>
      i.issue_type?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    );
  }, [query, subCategories]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize).map((r, i) => ({
    ...r,
    displayId: (page - 1) * pageSize + i + 1,
  }));

  return (
    <>
      <div className="mb-6">

        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 items center mb-2 ">

              <Button color="green"
                onClick={() => window.history.back()}
                className="rounded-full w-10 h-10 "
              >
                <ArrowLeft size={20} />

              </Button>
              <h1 className="text-xl font-semibold">Sub-Clouser Reason - {penalty_name || "Loading..."}</h1>
            </div>
            <p className="text-gray-600">Manage sub-penalties</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Back button */}


            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search sub-penalties..."
            />

            <Button
              color="green"
              onClick={openAdd}
              className="whitespace-nowrap px-4 flex items-center"
            >
              <Plus size={20} />
              <span className="hidden md:inline ml-2">Add Sub-Penalty</span>
            </Button>
          </div>

        </div>
      </div>

      {subCategories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No sub-penalties yet.</p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            isFromBasedata={true}
            rows={rows} actions={actions}
            isonviewdetails={true}
          />
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Sub-Penalty" : "Add Sub-Penalty"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >

        <DynamicForm
          fields={addPenaltySubCategoryFields}
          values={form}
          onChange={handleFormChange}
          schema={addPenaltySubCategorySchema}
          submitAttempted={submitAttempted}
        />
      </Modal>

      <ToastMessage open={toast.open} type={toast.type} message={toast.message} duration={4000}
        onClose={() => setToast({ ...toast, open: false })} />

      <Confirmation open={confirmOpen} title="Delete Sub-Penalty" message="This cannot be undone."
        confirmLabel="Delete" onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </>
  );
}