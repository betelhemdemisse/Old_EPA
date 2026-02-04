import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import { Plus } from "lucide-react";

// ✅ CHANGE SERVICE
import NewsService from "../../../services/news.service.js";

// Zod schema for news validation
const newsSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 18 characters"),
  news_description: z.string()
    .min(1, "Description is required")
    .max(5000, "Description cannot exceed 50 characters"),
  file: z.instanceof(File).nullable().optional(),
});

// Max character limits
const MAX_TITLE_LENGTH = 18;
const MAX_DESCRIPTION_LENGTH = 50;

export default function NewsList() {
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
    news_description: "",
    file: null,
  });

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [fileViewOpen, setFileViewOpen] = useState(false);
  const [fileToView, setFileToView] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
      Cell: (value, row) => {
        if (!value) {
          return (
            <span className="text-gray-400 italic">
              No file
            </span>
          );
        }
        return (
          <button
            onClick={() => handleFileView(row)}
            className="text-blue-600 hover:underline font-medium"
          >
            {value}
          </button>
        );
      },
    },
    {
      Header: "Description",
      accessor: "news_description",
      Cell: (value) => (
        <span
          title={value}
          className="cursor-help"
        >
          {truncateText(value, 20) || "No description"}
        </span>
      ),
    },
  ];

  const fetchNews = async () => {
    try {
      const data = await NewsService.getAllNews();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setToast({ open: true, message: "Failed to load news", type: "error" });
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleFormChange = (field, value) => {
    // Enforce character limits
    if (field === "title" && value.length > MAX_TITLE_LENGTH) {
      return; // Don't update if exceeds limit
    }
    if (field === "news_description" && value.length > MAX_DESCRIPTION_LENGTH) {
      return; // Don't update if exceeds limit
    }

    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    try {
      newsSchema.parse({
        ...form,
        file: form.file || undefined,
      });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setExistingFile(null);
    setForm({ title: "", news_description: "", file: null });
    setFormErrors({});
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = async (row) => {
    try {
      setIsEditing(true);
      setModalOpen(true);

      const res = await NewsService.getNewsById(row.news_id);
      if (!res?.data) {
        setToast({ open: true, message: "Failed to load news details", type: "error" });
        return;
      }

      const data = res.data;
      setSelectedItem(data);
      setExistingFile(data.file_path ? {
        name: data.file_name,
        path: data.file_path,
        type: data.file_name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/*'
      } : null);

      setForm({
        title: data.title || "",
        news_description: data.news_description || "",
        file: null,
      });
      setFormErrors({});
      setSubmitAttempted(false);
    } catch (error) {
      console.error("Error loading news for edit:", error);
      setToast({ open: true, message: "Failed to load news details", type: "error" });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSelectedItem(null);
    setExistingFile(null);
    setForm({ title: "", news_description: "", file: null });
    setFormErrors({});
    setSubmitAttempted(false);
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (!validateForm()) {
      setToast({ open: true, message: "Please fix the errors in the form", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("news_description", form.news_description);
    if (form.file) formData.append("file", form.file);

    try {
      let result;
      if (isEditing && selectedItem) {
        result = await NewsService.updateNews(selectedItem.news_id, formData);
      } else {
        result = await NewsService.createNews(formData);
      }

      if (result) {
        await fetchNews();
        closeModal();
        setToast({
          open: true,
          message: isEditing ? "News updated successfully ✅" : "News created successfully ✅",
          type: "success",
        });
      } else {
        setToast({ open: true, message: "Operation failed ❌", type: "error" });
      }
    } catch (error) {
      console.error("Error saving news:", error);
      setToast({ open: true, message: "Failed to save news", type: "error" });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.news_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;

    try {
      const result = await NewsService.deleteNews(toDeleteId);

      setToast({
        open: true,
        message: result ? "News deleted successfully 🗑️" : "Delete failed",
        type: result ? "success" : "error",
      });

      if (result) await fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      setToast({ open: true, message: "Failed to delete news", type: "error" });
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
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
        item.news_description?.toLowerCase().includes(q) ||
        item.file_name?.toLowerCase().includes(q)
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

  // Custom TextArea component with character counter
  const TextAreaWithCounter = ({ label, value, onChange, error, ...props }) => {
    const currentLength = value?.length || 0;
    const isNearLimit = currentLength > MAX_DESCRIPTION_LENGTH * 0.8; // 80% of limit
    const isOverLimit = currentLength > MAX_DESCRIPTION_LENGTH;

    return (
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {label}
        </label>

        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53] ${error ? 'border-red-500' : 'border-gray-300'
              }`}
            rows={4}
            {...props}
          />

          {/* Character Counter */}
          <div className={`text-xs mt-1 flex justify-end ${isOverLimit ? 'text-red-600 font-semibold' :
            isNearLimit ? 'text-amber-600' : 'text-gray-500'
            }`}>
            <span>
              {currentLength} / {MAX_DESCRIPTION_LENGTH} characters
              {isOverLimit && ' (Exceeded limit!)'}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };

  // Custom Input component with character counter for title
  const InputWithCounter = ({ label, value, onChange, error, ...props }) => {
    const currentLength = value?.length || 0;
    const isNearLimit = currentLength > MAX_TITLE_LENGTH * 0.8; // 80% of limit
    const isOverLimit = currentLength > MAX_TITLE_LENGTH;

    return (
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {label}
        </label>

        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53] ${error ? 'border-red-500' : 'border-gray-300'
              }`}
            {...props}
          />

          {/* Character Counter */}
          <div className={`text-xs mt-1 flex justify-end ${isOverLimit ? 'text-red-600 font-semibold' :
            isNearLimit ? 'text-amber-600' : 'text-gray-500'
            }`}>
            <span>
              {currentLength} / {MAX_TITLE_LENGTH} characters
              {isOverLimit && ' (Exceeded limit!)'}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };

  // Define form fields for DynamicForm with custom components
  const newsFormFields = [
    {
      name: "title",
      label: "Title",
      type: "text",
      placeholder: "Enter news title",
      grid: "col-span-6",
      props: {
        required: true,
        maxLength: MAX_TITLE_LENGTH,
      },
      Component: InputWithCounter,
    },
    {
      name: "news_description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter news description",
      grid: "col-span-6",
      props: {
        rows: 4,
        required: true,
        maxLength: MAX_DESCRIPTION_LENGTH,
      },
      Component: TextAreaWithCounter,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">News</h1>

        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search news..."
            className="flex-1"
          />

          <Button color="green" onClick={openAddModal}>
            <Plus size={20} />
            <span className="hidden md:inline ml-2">Add News</span>
          </Button>
        </div>
      </div>

      {/* Table */}

      <>
        <Table columns={columns} rows={rowsWithId} actions={actions} />
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </>


      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit News" : "Add News"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <div className="space-y-6">
          {/* Dynamic Form for title and description */}
          <div className="grid grid-cols-6 gap-4">
            {newsFormFields.map((field) => {
              const Component = field.Component || InputWithCounter;

              return (
                <div key={field.name} className={field.grid}>
                  <Component
                    label={field.label}
                    value={form[field.name]}
                    onChange={(value) => handleFormChange(field.name, value)}
                    error={formErrors[field.name]}
                    {...field.props}
                  />
                </div>
              );
            })}
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <label className="block font-medium text-gray-700 mb-2">
              Attachment {!isEditing && "(Optional)"}
            </label>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => handleFormChange("file", e.target.files?.[0] || null)}
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
                        {existingFile.path ? "Existing file" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Download Link */}
                    {existingFile.path && (
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
                    )}
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
            {form.file && (
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
                        {form.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(form.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {form.file.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFormChange("file", null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <p className="text-xs text-green-700 mt-2">
                  {existingFile ? "This file will replace the existing file" : "New file will be uploaded"}
                </p>
              </div>
            )}

            {/* File validation error */}
            {submitAttempted && formErrors.file && (
              <p className="text-xs text-red-500 mt-1">{formErrors.file}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
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
              {viewItem.news_description || "No description available."}
            </p>

            {viewItem.file_path && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachment:</p>
                <a
                  href={`${FILE_BASE_URL}/${normalizeFilePath(viewItem.file_path)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {viewItem.file_name || "View File"}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* File Preview Modal */}
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
        {fileToView?.file_path && (
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
                alt="News File"
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
        title="Delete News"
        message="Are you sure you want to delete this news content?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}