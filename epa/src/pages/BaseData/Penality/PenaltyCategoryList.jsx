// src/pages/base-data/penalty/PenaltyCategoryList.jsx
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

// Services
import services from "../../../services/penality.service.js";
const { PenaltyCategoryService } = services;

// Form config
import addPenaltyCategoryFields from "./addPenaltyCategoryFields.js";
import addPenaltyCategorySchema from "./addPenaltyCategorySchema.js";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Closure Reason", accessor: "penalty_name" },
  { Header: "Description", accessor: "description" },
];

export default function PenaltyCategoryList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal & Form
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({ penalty_name: "", description: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const fetchCategories = async () => {
    const result = await PenaltyCategoryService.getAllPenaltyCategories();
    console.log("result",result)
    if (result) setItems(result.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFormChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setForm({ penalty_name: "", description: "" });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedItem(row);
    setForm({
      penalty_name: row.penalty_name || "",
      description: row.description || "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ penalty_name: "", description: "" });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = addPenaltyCategorySchema.safeParse(form);
    if (!validation.success) {
      setToast({ open: true, message: "Please fix form errors", type: "error" });
      return;
    }

    try {
      let success = false;
      if (isEditing && selectedItem) {
        success = await PenaltyCategoryService.updatePenaltyCategory(selectedItem.penalty_id, form);
      } else {
        success = await PenaltyCategoryService.createPenaltyCategory(form);
      }

      if (success) {
        await fetchCategories();
        closeModal();
        setToast({
          open: true,
          message: isEditing ? "Updated successfully" : "Created successfully",
          type: "success",
        });
      }
    } catch (err) {
      setToast({ open: true, message: "Operation failed", type: "error" });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.penalty_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    const success = await PenaltyCategoryService.deletePenaltyCategory(toDeleteId);
    setToast({
      open: true,
      message: success ? "Deleted successfully" : "Delete failed",
      type: success ? "success" : "error",
    });
    if (success) await fetchCategories();
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const actions = {
    onEdit: openEditModal,
    onView: (row) =>
      navigate("/base-data/penalty/details", {
        state: { penalty_id: row.penalty_id, penalty_name: row.penalty_name },
      }),
    onDelete: handleDelete,
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items?.filter(
      (item) =>
        item.penalty_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [query, items]);

  const totalPages = Math.ceil(filtered?.length / pageSize);
  const sliced = filtered?.slice((page - 1) * pageSize, page * pageSize);
  const rowsWithId = sliced?.map((row, idx) => ({
    ...row,
    displayId: (page - 1) * pageSize + idx + 1,
  }));

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center">
            <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
          <h1 className="text-xl font-bold text-gray-800">Closure Reason</h1>
        </div>
          <div className="flex gap-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search penalty categories..." />

 <Button color="green" className="md:w-60" onClick={openAddModal}>
            <Plus size={20} />
            <span className="hidden md:inline ml-2">Add Category</span>
          </Button>

          </div>
         
        </div>
      </div>

      <div className="mb-4">
      </div>

      {items?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No penalty categories found.</p>
        
        </div>
      ) : (
        <>
          <Table isFromBasedata={true} columns={columns} rows={rowsWithId} actions={actions} />
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Closure Reason" : "Add Closure Reason"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <DynamicForm
          fields={addPenaltyCategoryFields}
          values={form}
          onChange={handleFormChange}
          schema={addPenaltyCategorySchema}
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
        title="Delete Closure Reason"
        message="This will also delete all sub-categories. Continue?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}