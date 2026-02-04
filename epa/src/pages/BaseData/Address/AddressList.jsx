// src/pages/base-data/address/AddressList.jsx
import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { ArrowBigLeftIcon, ArrowLeft, Plus } from "lucide-react";

// Service
import EPAOfficeLocationsService from "../../../services/epaOfficeLocations.service.js";

// Form Config (replace with your own form config file if needed)
import addAddressFields from "./addAddressFields.js";
import addAddressSchema from "./addAddressSchema.js";

const columns = [
    { Header: "No.", accessor: "displayId" },
    { Header: "Name", accessor: "name" },
    { Header: "Latitude", accessor: "latitude" },
    { Header: "Longitude", accessor: "longitude" },
    { Header: "Phone", accessor: "phone_number" },
    { Header: "Email", accessor: "email" },
    { Header: "Description", accessor: "description" },
];

export default function AddressList() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [form, setForm] = useState({
        name: "",
        latitude: "",
        longitude: "",
        phone_number: "",
        email: "",
        description: "",
    });

    const [toast, setToast] = useState({ open: false, message: "", type: "success" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    const fetchEPAOffices = async () => {
        const result = await EPAOfficeLocationsService.getAllEPAOfficeLocations();
        setItems(Array.isArray(result) ? result : []);
    };

    useEffect(() => {
        fetchEPAOffices();
    }, []);

    const handleFormChange = (name, value) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedItem(null);
        setForm({
            name: "",
            latitude: "",
            longitude: "",
            phone_number: "",
            email: "",
            description: "",
        });
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditing(true);
        setSelectedItem(row);
        setForm({
            name: row.name || "",
            latitude: row.latitude || "",
            longitude: row.longitude || "",
            phone_number: row.phone_number || "",
            email: row.email || "",
            description: row.description || "",
        });
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setIsEditing(false);
        setSelectedItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        const validation = addAddressSchema.safeParse(form);
        if (!validation.success) {
            setToast({ open: true, message: "Please fix form errors", type: "error" });
            return;
        }

        let success;

        if (isEditing && selectedItem) {
            success = await EPAOfficeLocationsService.updateEPAOfficeLocation(
                selectedItem.epa_office_location_id,
                form
            );
        } else {
            success = await EPAOfficeLocationsService.createEPAOfficeLocation(form);
        }

        if (success) {
            await fetchEPAOffices();
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
        setToDeleteId(row.epa_office_location_id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!toDeleteId) return;

        const success = await EPAOfficeLocationsService.deleteEPAOfficeLocation(toDeleteId);

        setToast({
            open: true,
            message: success ? "Deleted successfully 🗑️" : "Delete failed",
            type: success ? "success" : "error",
        });

        if (success) await fetchEPAOffices();

        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const actions = {
        onEdit: openEditModal,
        onDelete: handleDelete,
    };

    // Filtering Search
    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter((item) =>
            ["name", "email", "phone_number", "description"].some((field) =>
                item[field]?.toLowerCase().includes(q)
            )
        );
    }, [query, items]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

    const rowsWithId = sliced.map((row, idx) => ({
        ...row,
        id: row.epa_office_location_id,
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
                <h1 className="text-2xl font-bold text-gray-800 mb-3">EPA Office Locations</h1>

                </div>
               
                <div className="flex  md:flex-row md:items-center md:justify-between gap-4">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search addresses..."
                        className="flex-1"
                    />

                    <Button color="green" onClick={openAddModal}>
                        <Plus size={20} />
                        <span className="hidden md:inline ml-2">Add Office Location</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No EPA office locations found.</p>
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
                title={isEditing ? "Edit Office Location" : "Add Office Location"}
                width="w-full max-w-2xl"
                actions={[
                    <Button key="cancel" onClick={closeModal}>Cancel</Button>,
                    <Button key="save" color="green" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Save"}
                    </Button>,
                ]}
            >
                <DynamicForm
                    fields={addAddressFields}
                    values={form}
                    onChange={handleFormChange}
                    schema={addAddressSchema}
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
                title="Delete Office Location"
                message="Are you sure you want to delete this office location?"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
