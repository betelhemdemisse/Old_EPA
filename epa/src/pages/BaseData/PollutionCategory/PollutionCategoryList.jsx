import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import { ArrowLeft, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import services from "../../../services/PollutionCategory.service.js";

import addPollutionCategoryFields from "./addPollutionCategoryFields.js";
import addPollutionCategorySchema from "./addPollutionCategorySchema.js";
import addSubPollutionCategoryFields from "./addSubPollutionCategoryFields.js";
import addSubPollutionCategorySchema from "./addSubPollutionCategorySchema.js";
import { useNavigate } from "react-router-dom";

const { PollutionCategoryService, SubPollutionCategoryService } = services;

const pollutionCategoryColumns = [
  { Header: "ID", accessor: "displayId" },
  { Header: "Pollution Category", accessor: "pollution_category" },
  { Header: "Description", accessor: "description" },
  {
    Header: "Is Sound Pollution",
    accessor: "is_sound",
    Cell: (value) => (value === true ? "Yes" : "No"),
  },
];



export default function PollutionCategoryList() {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 8;
    const navigate = useNavigate();

    // Modals
    const [mainModalOpen, setMainModalOpen] = useState(false);
    const [subModalOpen, setSubModalOpen] = useState(false);

    const [selectedPollutionCategory, setSelectedPollutionCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [mainForm, setMainForm] = useState({ pollution_category: "", description: "", is_sound: false, });

    // subForm NO LONGER contains pollution_category_id
    const [subForm, setSubForm] = useState({
        sub_pollution_category: "",
        description: "",
    });

    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", type: "success" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Handlers
    const handleMainFormChange = (name, value) =>
        setMainForm((f) => ({ ...f, [name]: value }));

    const handleSubFormChange = (name, value) =>
        setSubForm((f) => ({ ...f, [name]: value }));

    useEffect(() => {
        const fetchData = async () => {
            const result = await PollutionCategoryService.getAllPollutionCategories();
            if (result) setItems(result);
        };
        fetchData();
    }, []);

    // Main Category Modal
    const handleAdd = () => {
        setSubmitAttempted(false);
        setMainModalOpen(true);
        setIsEditing(false);
        setSelectedItem(null);
        setMainForm({ pollution_category: "", description: "", is_sound: false });
    };

    const handleMainModalClose = () => {
        setMainModalOpen(false);
        setMainForm({ pollution_category: "", description: "", is_sound: false });
        setIsEditing(false);
        setSelectedItem(null);
    };

    // Sub Category Modal
    const handleAddSubCategory = (pollutionCategory) => {
        setSelectedPollutionCategory(pollutionCategory);
        setSubForm({ sub_pollution_category: "", description: "" });
        setSubmitAttempted(false);
        setSubModalOpen(true);
    };

    const handleSubModalClose = () => {
        setSubModalOpen(false);
        setSubForm({ sub_pollution_category: "", description: "" });
        setSelectedPollutionCategory(null);
    };

    // Submit Main Category
    const handleMainFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        const res = addPollutionCategorySchema.safeParse(mainForm);
        if (!res.success) {
            setToast({ open: true, message: "Please fix form errors", type: "error" });
            return;
        }

        try {
            if (isEditing && selectedItem) {
                await PollutionCategoryService.updatePollutionCategory(selectedItem.id, mainForm);
                setToast({ open: true, message: "Updated successfully", type: "success" });
            } else {
                await PollutionCategoryService.createPollutionCategory(mainForm);
                setToast({ open: true, message: "Created successfully", type: "success" });
            }
            const result = await PollutionCategoryService.getAllPollutionCategories();
            if (result) setItems(result);
            handleMainModalClose();
        } catch (err) {
            setToast({ open: true, message: "Operation failed", type: "error" });
        }
    };

    // Submit Sub Category — FIXED & CLEAN
    const handleSubFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!selectedPollutionCategory?.pollution_category_id) {
            setToast({ open: true, message: "Parent category missing", type: "error" });
            return;
        }
        console.log("Selected Pollution Category ID:", selectedPollutionCategory.pollution_category_id);
        const payload = {
            sub_pollution_category: subForm.sub_pollution_category.trim(),
            description: subForm.description.trim(),
            pollution_category_id: selectedPollutionCategory.pollution_category_id, // SOURCE OF TRUTH
        };

        const validation = addSubPollutionCategorySchema.safeParse(payload);
        if (!validation.success) {
            setToast({ open: true, message: "Please fill all required fields correctly", type: "error" });
            return;
        }

        try {
            const created = await SubPollutionCategoryService.createSubPollutionCategory(payload);
            if (created) {
                setToast({ open: true, message: "Sub-category added successfully", type: "success" });
                handleSubModalClose();
            } else {
                setToast({ open: true, message: "Failed to add sub-category", type: "error" });
            }
        } catch (error) {
            console.error(error);
            setToast({ open: true, message: "Server error", type: "error" });
        }
    };

    // Actions
    const actions = {
        onEdit: (row) => {
            setIsEditing(true);
            setSelectedItem({ ...row, id: row.pollution_category_id });
            setMainForm({
                pollution_category: row.pollution_category,
                description: row.description || "",
                is_sound: row.is_sound || false,
            });
            setSubmitAttempted(false);
            setMainModalOpen(true);
        },
        onView: (row) => {
            navigate("/base-data/pollutioncategory/details", {
                state: {
                    pollution_category_id: row.pollution_category_id,
                    pollution_category: row.pollution_category,
                },
            });
        },
        onAdd: (row) => handleAddSubCategory(row),
        onDelete: (row) => {
            setToDeleteId(row.pollution_category_id);
            setConfirmOpen(true);
        },
    };

    const handleConfirmDelete = async () => {
        if (!toDeleteId) return setConfirmOpen(false);

        const success = await PollutionCategoryService.deletePollutionCategory(toDeleteId);
        setToast({
            open: true,
            message: success ? "Deleted successfully" : "Delete failed",
            type: success ? "success" : "error",
        });

        if (success) {
            const result = await PollutionCategoryService.getAllPollutionCategories();
            if (result) setItems(result);
        }

        setConfirmOpen(false);
        setToDeleteId(null);
    };

    // Search & Pagination
    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;
        return items.filter(
            (r) =>
                r.pollution_category.toLowerCase().includes(q) ||
                (r.description && r.description.toLowerCase().includes(q))
        );
    }, [query, items]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
    const rowsWithDisplayId = slice.map((row, idx) => ({
        ...row,
        displayId: (page - 1) * pageSize + idx + 1,
    }));

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
                <h1 className="text-xl font-semibold">Pollution Category Management</h1>
                </div>
                <div className="my-3 gap-4 flex">
                    <SearchInput value={query} onChange={setQuery} placeholder="Search pollution categories..." />

                    <Button color="green" className="" onClick={handleAdd}>
                        <Plus />
                        <span className="hidden md:flex lg:w-32 ">Add Category</span>
                    </Button>
                </div>
            </div>



            <Table
                isFromBasedata={true}
                basedataTitle="sub-category"
                columns={pollutionCategoryColumns} rows={rowsWithDisplayId} actions={actions} />
            <Pagination page={page} total={totalPages} onChange={setPage} />

            {/* Main Modal */}
            <Modal
                open={mainModalOpen}
                onClose={handleMainModalClose}
                width="w-full max-w-2xl"
                title={isEditing ? "Edit Pollution Category" : "Add Pollution Category"}
                actions={[
                    <Button key="cancel" onClick={handleMainModalClose}>Cancel</Button>,
                    <Button key="save" color="green" onClick={handleMainFormSubmit}>
                        {isEditing ? "Update" : "Save"}
                    </Button>,
                ]}
            >
                <DynamicForm
                    fields={addPollutionCategoryFields}
                    values={mainForm}
                    onChange={handleMainFormChange}
                    schema={addPollutionCategorySchema}
                    submitAttempted={submitAttempted}
                />

                <div className="mt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600"
                        checked={mainForm.is_sound}
                        onChange={(e) =>
                            setMainForm((f) => ({
                                ...f,
                                is_sound: e.target.checked,
                            }))
                        }
                    />
                    <label className="text-sm text-gray-700">
                        Is Sound Pollution?
                    </label>
                </div>
            </Modal>

            {/* Sub Modal */}
            <Modal
                open={subModalOpen}
                onClose={handleSubModalClose}
                width="w-full max-w-2xl"
                title="Add Sub-Pollution Category"
                actions={[
                    <Button key="cancel" onClick={handleSubModalClose}>Cancel</Button>,
                    <Button key="save" color="green" onClick={handleSubFormSubmit}>Save</Button>,
                ]}
            >


                <DynamicForm
                    fields={addSubPollutionCategoryFields}
                    values={subForm}
                    onChange={handleSubFormChange}
                    schema={addSubPollutionCategorySchema}
                    submitAttempted={submitAttempted}
                />
            </Modal>

            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                duration={4000}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
            />

            <Confirmation
                open={confirmOpen}
                title="Delete Category"
                message="This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}