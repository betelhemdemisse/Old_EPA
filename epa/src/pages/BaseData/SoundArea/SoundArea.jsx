// src/pages/base-data/sound-area/SoundAreaList.jsx
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
import SoundAreaService from "../../../services/soundareas.service.js";

// Form Config
import addSoundAreaFields from "./addSoundAreaFields.js";
import addSoundAreaSchema from "./addSoundAreaSchema.js";

const columns = [
    { Header: "No.", accessor: "displayId" },
    { Header: "Name", accessor: "name" },
    { Header: "Description", accessor: "description" },
];

export default function SoundAreaList() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form, setForm] = useState({ name: "", description: "" });
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [toast, setToast] = useState({ open: false, message: "", type: "success" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    const fetchSoundAreas = async () => {
        const result = await SoundAreaService.getAllSoundAreas();
        setItems(Array.isArray(result) ? result : []);
    };



    useEffect(() => {
        fetchSoundAreas();
    }, []);

    const handleFormChange = (name, value) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedItem(null);
        setForm({ name: "", description: "" });
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditing(true);
        setSelectedItem(row);
        setForm({
            name: row.name || "",
            description: row.description || "",
        });
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setForm({ name: "", description: "" });
        setIsEditing(false);
        setSelectedItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        const validation = addSoundAreaSchema.safeParse(form);
        if (!validation.success) {
            setToast({ open: true, message: "Please fix form errors", type: "error" });
            return;
        }

        let success;
        if (isEditing && selectedItem) {
            success = await SoundAreaService.updateSoundArea(
                selectedItem.sound_area_id,
                form
            );
        } else {
            success = await SoundAreaService.createSoundArea(form);
        }

        if (success) {
            await fetchSoundAreas();
            closeModal();
            setToast({
                open: true,
                message: isEditing ? "Updated successfully ✅" : "Created successfully ✅",
                type: "success",
            });
        } else {
            setToast({ open: true, message: "Operation failed ❌", type: "error" });
        }
    };

    const handleDelete = (row) => {
        setToDeleteId(row.sound_area_id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!toDeleteId) return;

        const success = await SoundAreaService.deleteSoundArea(toDeleteId);

        setToast({
            open: true,
            message: success ? "Deleted successfully 🗑️" : "Delete failed",
            type: success ? "success" : "error",
        });

        if (success) await fetchSoundAreas();

        setConfirmOpen(false);
        setToDeleteId(null);
    };

    // Actions (Edit & Delete only)
    const actions = {
        onEdit: openEditModal,
        onDelete: handleDelete,
    };

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter(
            (item) =>
                item.name?.toLowerCase().includes(q) ||
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
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Sound Areas</h1>
</div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search sound areas..."
                        className="flex-1"
                    />

                    <Button color="green" onClick={openAddModal}>
                        <Plus size={20} />
                        <span className="hidden md:inline ml-2">Add Sound Area</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No sound areas found.</p>
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
                title={isEditing ? "Edit Sound Area" : "Add Sound Area"}
                width="w-full max-w-2xl"
                actions={[
                    <Button key="cancel" onClick={closeModal}>Cancel</Button>,
                    <Button key="save" color="green" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Save"}
                    </Button>,
                ]}
            >
                <DynamicForm
                    fields={addSoundAreaFields}
                    values={form}
                    onChange={handleFormChange}
                    schema={addSoundAreaSchema}
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
                title="Delete Sound Area"
                message="Are you sure you want to delete this sound area?"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
