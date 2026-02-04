import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import { Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";

import SubPollutionCategoryService from "../../../services/SubPollutionCategory.service.js";
import PollutionCategoryService from "../../../services/PollutionCategory.service.js";

import addSubPollutionCategoryFields from "./addSubPollutionCategoryFields.js";
import addSubPollutionCategorySchema from "./addSubPollutionCategorySchema.js";

// Table Columns
const subPollutionCategoryColumns = [
    { Header: "ID", accessor: "id" },
    { Header: "Category", accessor: "pollution_category_name" },
    { Header: "Sub Category", accessor: "sub_pollution_category" },
    { Header: "Description", accessor: "description" },
];

export default function SubPollutionCategoryList() {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [modalOpen, setModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        pollution_category_id: "",
        sub_pollution_category: "",
        description: "",
    });

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        message: "",
        type: "success",
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Handle Form Change
    const handleFormChange = (name, value) => {
        // Convert pollution_category_id to number
        if (name === "pollution_category_id") {
            value = Number(value);
        }

        setForm((f) => ({ ...f, [name]: value }));
    };

    // Load sub categories + pollution categories
    useEffect(() => {
        const fetchData = async () => {
            const result = await SubPollutionCategoryService.getAllSubPollutionCategories();
            const cats = await PollutionCategoryService.getAllPollutionCategories();

            if (result) setItems(result);
            if (cats) setCategories(cats);
        };
        fetchData();
    }, []);


    const handleAdd = () => {
        setSubmitAttempted(false);
        setModalOpen(true);
        setIsEditing(false);
        setSelectedItem(null);
        setForm({
            pollution_category_id: "",
            sub_pollution_category: "",
            description: "",
        });
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setForm({
            pollution_category_id: "",
            sub_pollution_category: "",
            description: "",
        });
        setIsEditing(false);
        setSelectedItem(null);
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        const res = addSubPollutionCategorySchema.safeParse(form);
        if (!res.success) {
            alert("Fix validation errors before submitting.");
            return;
        }

        if (isEditing && selectedItem) {
            const updated = await SubPollutionCategoryService.updateSubPollutionCategory(
                selectedItem.id,
                form
            );

            if (updated) {
                setToast({
                    open: true,
                    message: "Sub-pollution category updated successfully",
                    type: "success",
                });
                const reload = await SubPollutionCategoryService.getAllSubPollutionCategories();
                if (reload) setItems(reload);
            }
        } else {
            const created = await SubPollutionCategoryService.createSubPollutionCategory(form);

            if (created) {
                setToast({
                    open: true,
                    message: "Sub-pollution category added successfully",
                    type: "success",
                });
                const reload = await SubPollutionCategoryService.getAllSubPollutionCategories();
                if (reload) setItems(reload);
            }
        }

        handleModalClose();
    };


    const actions = {
        onEdit: (row) => {
            setIsEditing(true);
            setSelectedItem(row);
            setForm({
                pollution_category_id: row.pollution_category_id,
                sub_pollution_category: row.sub_pollution_category,
                description: row.description,
            });
            setSubmitAttempted(false);
            setModalOpen(true);
        },

        onDelete: (row) => {
            setToDeleteId(row.id);
            setConfirmOpen(true);
        },
    };

    const handleConfirmDelete = async () => {
        if (!toDeleteId) return setConfirmOpen(false);

        const deleted = await SubPollutionCategoryService.deleteSubPollutionCategory(toDeleteId);

        if (deleted) {
            setToast({
                open: true,
                message: "Sub-pollution category deleted successfully",
                type: "success",
            });

            const reload = await SubPollutionCategoryService.getAllSubPollutionCategories();
            if (reload) setItems(reload);
        }

        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter(
            (r) =>
                r.sub_pollution_category.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q)
        );
    }, [query, items]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const slice = filtered.slice((page - 1) * pageSize, page * pageSize);


    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-white p-4">
                <div className="flex justify-between items-center">
                      <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
                    <h1 className="text-xl font-bold">Sub Pollution Category Management</h1>
</div>
                    <Button color="green" onClick={handleAdd}>
                        <Plus />
                        <span className="hidden md:flex">Add Sub Category</span>
                    </Button>
                </div>

                <div className="my-3">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search sub pollution categories..."
                    />
                </div>

                <Table isFromBasedata={true} columns={subPollutionCategoryColumns} rows={slice} actions={actions} />

                <Pagination page={page} total={totalPages} onChange={setPage} />

                {/* MODAL FORM */}
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                    title={isEditing ? "Edit Sub Pollution Category" : "Add Sub Pollution Category"}
                    actions={[
                        <Button key="cancel" onClick={handleModalClose}>
                            Cancel
                        </Button>,
                        <Button key="save" color="green" onClick={handleFormSubmit}>
                            {isEditing ? "Update" : "Save"}
                        </Button>,
                    ]}
                >
                    <DynamicForm
                        fields={addSubPollutionCategoryFields(categories)}
                        values={form}
                        onChange={handleFormChange}
                        schema={addSubPollutionCategorySchema}
                        submitAttempted={submitAttempted}
                    />
                </Modal>

                <ToastMessage
                    open={toast.open}
                    type={toast.type}
                    message={toast.message}
                    duration={3500}
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                />

                <Confirmation
                    open={confirmOpen}
                    title="Delete Sub Pollution Category"
                    message="Are you sure you want to delete this item?"
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </div>
    );
}
