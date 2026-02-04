import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { ArrowLeft, Plus } from "lucide-react";

// Service
import AwarenessService from "../../../services/awareness.service.js";

export default function AwarenessList() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const FILE_BASE_URL = "http://196.188.240.103:4032/public";

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [form, setForm] = useState({
        title: "",
        awareness_description: "",
        file: null,
    });
    const selectedFile = form.file;

    const [toast, setToast] = useState({ open: false, message: "", type: "success" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [fileViewOpen, setFileViewOpen] = useState(false);
    const [fileToView, setFileToView] = useState(null);

    const handleFileView = (row) => {
        setFileToView(row);
        setFileViewOpen(true);
    };


    const handleView = (row) => {
        setViewItem(row);
        setViewOpen(true);
    };

    const truncateText = (text, maxLength = 20) => {
        if (!text) return "";
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    const columns = [
        { Header: "No.", accessor: "displayId" },
        {
            Header: "Title",
            accessor: "title",
            Cell: (value) => (
                <span
                    title={value}
                    className="cursor-help"
                >
                    {truncateText(value, 20)}
                </span>
            ),
        },
        {
            Header: "File",
            accessor: "file_name",
            Cell: (value, row) => (
                <button
                    onClick={() => handleFileView(row)}
                    className="text-blue-600 hover:underline font-medium"
                >
                    {value || "View File"}
                </button>
            ),
        },
    ];

    const fetchAwareness = async () => {
        const data = await AwarenessService.getAllAwareness();
        setItems(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        fetchAwareness();
    }, []);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedItem(null);
        setForm({ title: "", awareness_description: "", file: null });
        setModalOpen(true);
    };

    const openEditModal = async (row) => {
        setIsEditing(true);
        setModalOpen(true);

        const res = await AwarenessService.getAwarenessById(row.awareness_id);
        console.log("res_file", res);

        if (!res?.data) return;

        const data = res.data;

        setSelectedItem(data);
        setExistingFile({
            name: data.file_name,
            path: data.file_path,
        });

        setForm({
            title: data.title || "",
            awareness_description: data.awareness_description || "",
            file: null,
        });
    };


    const closeModal = () => {
        setModalOpen(false);
        setIsEditing(false);
        setSelectedItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.awareness_description) {
            setToast({ open: true, message: "Please fill required fields", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("awareness_description", form.awareness_description);
        if (form.file) formData.append("file", form.file);

        let result;
        if (isEditing && selectedItem) {
            result = await AwarenessService.updateAwareness(
                selectedItem.awareness_id,
                formData
            );
        } else {
            result = await AwarenessService.createAwareness(formData);
        }

        if (result) {
            await fetchAwareness();
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
        setToDeleteId(row.awareness_id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!toDeleteId) return;

        const result = await AwarenessService.deleteAwareness(toDeleteId);

        setToast({
            open: true,
            message: result ? "Deleted successfully 🗑️" : "Delete failed",
            type: result ? "success" : "error",
        });

        if (result) await fetchAwareness();

        setConfirmOpen(false);
        setToDeleteId(null);
    };

    const actions = {
        onView: handleView,
        onEdit: openEditModal,
        onDelete: handleDelete,
    };


    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter(
            (item) =>
                item.title?.toLowerCase().includes(q) ||
                item.awareness_description?.toLowerCase().includes(q)
        );
    }, [query, items]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

    const rowsWithId = sliced.map((row, idx) => ({
        ...row,
        displayId: (page - 1) * pageSize + idx + 1,
    }));

    const normalizeFilePath = (path) =>
        path?.replace(/\\/g, "/").replace(/^public\//, "");


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
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">Awareness</h1>

                </div>


                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search awareness..."
                        className="flex-1"
                    />

                    <Button color="green" onClick={openAddModal}>
                        <Plus size={20} />
                        <span className="hidden md:inline ml-2">Add Awareness</span>
                    </Button>
                </div>
            </div>

            {/* Table */}
            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No awareness content found.</p>
                </div>
            ) : (
                <>
                    <Table columns={columns} rows={rowsWithId} actions={actions} />
                    <Pagination page={page} total={totalPages} onChange={setPage} />
                </>
            )}

            {/* Modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                title={isEditing ? "Edit Awareness" : "Add Awareness"}
                width="w-full max-w-2xl"
                actions={[
                    <Button key="cancel" onClick={closeModal}>Cancel</Button>,
                    <Button key="save" color="green" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Save"}
                    </Button>,
                ]}
            >
                <form className="space-y-4">
                    <input
                        className="w-full border rounded px-4 py-2"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />

                    <textarea
                        className="w-full border rounded px-4 py-2"
                        placeholder="Description"
                        rows={4}
                        value={form.awareness_description}
                        onChange={(e) =>
                            handleChange("awareness_description", e.target.value)
                        }
                    />

                    <div className="space-y-4">
                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={(e) => handleChange("file", e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />

                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    <span className="text-blue-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF, JPG, PNG (MAX. 10MB)
                                </p>
                            </label>
                        </div>

                        {/* Existing File Preview */}
                        {existingFile && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {/* File Icon */}
                                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                            {existingFile.type === 'application/pdf' ? (
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {existingFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {existingFile.size ? `${(existingFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                                {existingFile.type ? ` • ${existingFile.type.split('/')[1].toUpperCase()}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        {/* Download Link */}
                                        <a
                                            href={`${FILE_BASE_URL}/${normalizeFilePath(existingFile.path)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            View
                                        </a>

                                    </div>
                                </div>

                                {/* Replacement Notice */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Upload a new file only if you want to replace it
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Selected File Preview (NEW UPLOAD) */}
                        {selectedFile && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 12l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                                                {selectedFile.type.split("/")[1].toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleChange("file", null)}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <p className="text-xs text-green-700 mt-2">
                                    This file will replace the existing file
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
            <Modal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                width="w-full max-w-xl"
                actions={[
                    <Button key="close" onClick={() => setViewOpen(false)}>
                        Close
                    </Button>,
                ]}
            >
                {viewItem && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {viewItem.title}
                        </h2>

                        <p className="text-gray-700 whitespace-pre-line">
                            {viewItem.awareness_description || "No description available."}
                        </p>
                    </div>
                )}
            </Modal>
            <Modal
                open={fileViewOpen}
                onClose={() => setFileViewOpen(false)}
                title="View File"
                width="w-full max-w-4xl"
                actions={[
                    <Button key="close" onClick={() => setFileViewOpen(false)}>
                        Close
                    </Button>,
                ]}
            >
                {fileToView && (
                    <div className="w-full h-[70vh]">
                        {fileToView.file_name?.toLowerCase().endsWith(".pdf") ? (
                            <iframe
                                src={`${FILE_BASE_URL}/${normalizeFilePath(fileToView.file_path)}`}
                                title="PDF Preview"
                                className="w-full h-full border rounded"
                            />
                        ) : (
                            <img
                                src={`${FILE_BASE_URL}/${normalizeFilePath(fileToView.file_path)}`}
                                alt="Awareness File"
                                className="max-w-full max-h-full mx-auto rounded shadow"
                            />
                        )}
                    </div>
                )}
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
                title="Delete Awareness"
                message="Are you sure you want to delete this awareness content?"
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
