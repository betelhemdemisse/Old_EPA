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

// Services
import services from "../../../services/PollutionCategory.service.js";
const { SubPollutionCategoryService, PollutionCategoryService } = services;

// Form config
import addSubPollutionCategoryFields from "./addSubPollutionCategoryFields.js";
import addSubPollutionCategorySchema from "./addSubPollutionCategorySchema.js";


const subCategoryColumns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Sub-Category Name", accessor: "sub_pollution_category" },
  {
    Header: "Investigation Days",
    accessor: "investigation_days",
    Cell: (cellProps) => {
      console.log("cellProps", cellProps)
    },
  },
  { Header: "Description", accessor: "description" },
];

export default function PollutionCategoryDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  const { pollution_category_id, pollution_category } = location.state || {};

  // Safety redirect
  useEffect(() => {
    if (!pollution_category_id || !pollution_category) {
      navigate("/base-data/pollutioncategory", { replace: true });
    }
  }, [pollution_category_id, pollution_category, navigate]);

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Form state
  const [form, setForm] = useState({
    sub_pollution_category: "",
    description: "",
    investigation_days: null,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // Fetch category with subcategories
  const fetchSubCategories = async () => {
    if (!pollution_category_id) return;

    setLoading(true);
    try {
      const result = await PollutionCategoryService.getPollutionCategoryById(
        pollution_category_id
      );

      if (result) {
        setSubCategories(result.subcategories || []);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch sub-categories:", err);
      setToast({
        open: true,
        message: "Failed to load sub-categories",
        type: "error",
      });
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [pollution_category_id]);

  const handleFormChange = (name, value) => {
    if (name === "investigation_days") {
      // Allow only digits
      if (/^\d*$/.test(value)) {
        setForm((prev) => ({
          ...prev,
          [name]: value === "" ? "" : parseInt(value, 10) // always integer
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };


  const openAddModal = () => {
    setIsEditing(false);
    setSelectedSubCategory(null);
    setForm({
      sub_pollution_category: "",
      description: "",
      investigation_days: null,
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedSubCategory(row);
    setForm({
      sub_pollution_category: row.sub_pollution_category || "",
      description: row.description || "",
      investigation_days: row.investigation_days || null, // Convert to string for input
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      sub_pollution_category: "",
      description: "",
      investigation_days: null,
    });
    setIsEditing(false);
    setSelectedSubCategory(null);
    setSubmitAttempted(false);
  };

  // Prepare form data for validation and submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Prepare form data for validation
    const formDataForValidation = {
      sub_pollution_category: form.sub_pollution_category.trim(),
      description: form.description.trim() || undefined,
      investigation_days: form.investigation_days === ""
        ? undefined
        : form.investigation_days, // already an integer
    };


    // Validate
    const validation = addSubPollutionCategorySchema.safeParse(formDataForValidation);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "Please fix form errors";
      setToast({ open: true, message: errorMsg, type: "error" });
      return;
    }

    try {
      if (isEditing && selectedSubCategory) {
        // Update existing sub-category
        const updatePayload = {
          sub_pollution_category: form.sub_pollution_category.trim(),
          description: form.description.trim() || null,
          investigation_days: form.investigation_days === ""
            ? null
            : Number(form.investigation_days),
        };

        const result = await SubPollutionCategoryService.updateSubPollutionCategory(
          selectedSubCategory.sub_pollution_category_id,
          updatePayload
        );

        if (result) {
          setToast({
            open: true,
            message: "Sub-category updated successfully",
            type: "success",
          });
          await fetchSubCategories();
          closeModal();
        } else {
          setToast({
            open: true,
            message: "Update failed",
            type: "error",
          });
        }
      } else {
        // Create new sub-category
        const createPayload = {
          sub_pollution_category: form.sub_pollution_category.trim(),
          description: form.description.trim() || null,
          investigation_days: form.investigation_days === "" ? null : form.investigation_days,
          pollution_category_id,
        };

        const result = await SubPollutionCategoryService.createSubPollutionCategory(
          createPayload
        );

        if (result) {
          setToast({
            open: true,
            message: "Sub-category added successfully",
            type: "success",
          });
          await fetchSubCategories();
          closeModal();
        } else {
          setToast({
            open: true,
            message: "Creation failed",
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Server error. Please try again.",
        type: "error",
      });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.sub_pollution_category_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;

    try {
      const success = await SubPollutionCategoryService.deleteSubPollutionCategory(
        toDeleteId
      );

      setToast({
        open: true,
        message: success ? "Deleted successfully" : "Delete failed",
        type: success ? "success" : "error",
      });

      if (success) {
        await fetchSubCategories();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        type: "error"
      });
    }

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const actions = {
    onEdit: openEditModal,
    onDelete: handleDelete,
  };

  // Search with numeric handling
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return subCategories;

    return subCategories.filter((item) => {
      if (
        item.sub_pollution_category?.toLowerCase().includes(q) ||
        item.investigation_days.includes(q) ||
        item.description?.toLowerCase().includes(q)
      ) {
        return true;
      }

      // Search in numeric field
      if (item.investigation_days != null) {
        return item.investigation_days.toString().includes(q);
      }

      return false;
    });
  }, [query, subCategories]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
  console.log("sliiiiiiices", sliced)
  const rowsWithId = sliced.map((row, idx) => ({
    ...row,
    displayId: (page - 1) * pageSize + idx + 1,
    investigation_days: row.investigation_days != null ? row.investigation_days : "",
  }));

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
  <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
            <h1 className="text-xl font-bold text-gray-900">
              Manage Subcategories - {pollution_category}
            </h1>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Manage subCategories for this pollution category
            </p>
          </div>

          <div className="flex items-center gap-4">
          

            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search sub-categories..."
              className="w-64"
            />

            <Button
              color="green"
              onClick={openAddModal}
              className="flex items-center"
            >
              <Plus size={20} />
              <span className="ml-2 hidden md:inline w-36">Add Sub-Category</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">
          Loading sub-categories...
        </div>
      ) : (
        <>
        
            <>
              {/* Results count */}


              {/* Table */}
              <Table
                columns={subCategoryColumns}
                rows={rowsWithId}
                actions={actions}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
        
        </>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Sub-Category" : "Add New Sub-Category"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <DynamicForm
          fields={addSubPollutionCategoryFields}
          values={form}
          onChange={handleFormChange}
          schema={addSubPollutionCategorySchema}
          submitAttempted={submitAttempted}
        />
      </Modal>

      {/* Toast Message */}
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      />

      {/* Confirmation Dialog */}
      <Confirmation
        open={confirmOpen}
        title="Delete Sub-Category"
        message="Are you sure you want to delete this sub-category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}