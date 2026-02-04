// src/pages/base-data/report-type/ReportTypesList.jsx
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
import { Plus } from "lucide-react";

// Service
import ReportTypeService from "../../../services/reportType.service.js";
import SubPollutionCategoryService from "../../../services/SubPollutionCategory.service.js"; // make sure you have this

// Form Config
import addReportTypeFields from "./addReportTypeFields.js";
import addReportTypeSchema from "./addReportTypeSchema.js";
import { ArrowLeft } from "lucide-react";
import FilterTab from "../../../components/Form/FilterTab.jsx";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Report Type", accessor: "report_type" },
  { Header: "Sub-Pollution Category", accessor: "sub_pollution_category" },
];

export default function ReportTypesList({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({
    report_type: "",
    sub_pollution_category_id: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [subPollutionOptions, setSubPollutionOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubPollutionCategories = async () => {
    try {
      const result = await SubPollutionCategoryService.getAllSubPollutionCategories();
      console.log("SubPollutionCategories fetched:", result);

      if (result) {
        setSubPollutionOptions(
          result.map((item) => ({
            label: item.sub_pollution_category,
            value: String(item.sub_pollution_category_id) // Ensure values are strings
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching sub-pollution categories:", error);
    }
  };

  useEffect(() => {
    fetchReportTypes();
    fetchSubPollutionCategories();
  }, []);

  const fetchReportTypes = async () => {
    setLoading(true);
    try {
      const result = await ReportTypeService.getAllReportTypes();
      if (result) {
        // Enhance items with sub-pollution category name for display
        const enhancedItems = await Promise.all(
          result.map(async (item) => {
            if (item.sub_pollution_category_id) {
              try {
                const subPollutionResult = await SubPollutionCategoryService.getSubPollutionCategoryById(item.sub_pollution_category_id);
                return {
                  ...item,
                  sub_pollution_category: subPollutionResult?.sub_pollution_category || "N/A"
                };
              } catch (error) {
                console.error(`Error fetching sub-pollution category ${item.sub_pollution_category_id}:`, error);
                return { ...item, sub_pollution_category: "N/A" };
              }
            }
            return { ...item, sub_pollution_category: "N/A" };
          })
        );
        setItems(enhancedItems);
      }
    } catch (error) {
      console.error("Error fetching report types:", error);
      setToast({ open: true, message: "Failed to load report types", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (name, value) => {
    console.log(`Form change: ${name} = ${value}`);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setForm({
      report_type: "",
      sub_pollution_category_id: "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedItem(row);
    // Ensure sub_pollution_category_id is string for proper dropdown selection
    setForm({
      report_type: row.report_type || "",
      sub_pollution_category_id: String(row.sub_pollution_category_id || ""),
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      report_type: "",
      sub_pollution_category_id: "",
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validation = addReportTypeSchema.safeParse(form);
    if (!validation.success) {
      console.error("Form validation errors:", validation.error.errors);
      setToast({ open: true, message: "Please fix form errors", type: "error" });
      return;
    }

    try {
      let success;
      if (isEditing && selectedItem) {
        success = await ReportTypeService.updateReportType(selectedItem.report_type_id, form);
      } else {
        success = await ReportTypeService.createReportType(form);
      }

      if (success) {
        await fetchReportTypes();
        closeModal();
        setToast({
          open: true,
          message: isEditing ? "Updated successfully" : "Created successfully",
          type: "success",
        });
      } else {
        setToast({ open: true, message: "Operation failed", type: "error" });
      }
    } catch (error) {
      console.error("Error saving report type:", error);
      setToast({ open: true, message: "Operation failed", type: "error" });
    }
  };

  const handleDelete = (row) => {
    setToDeleteId(row.report_type_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDeleteId) return;

    const success = await ReportTypeService.deleteReportType(toDeleteId);

    setToast({
      open: true,
      message: success ? "Deleted successfully" : "Delete failed",
      type: success ? "success" : "error",
    });

    if (success) await fetchReportTypes();

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  // Add view action
  const actions = {
    onEdit: openEditModal,
    onDelete: handleDelete,
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;

    return items.filter(
      (item) =>
        item.report_type?.toLowerCase().includes(q) ||
        item.sub_pollution_category?.toLowerCase().includes(q)
    );
  }, [query, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);
  const rowsWithId = sliced.map((row, idx) => ({
    ...row,
    displayId: (page - 1) * pageSize + idx + 1,
  }));

  // Prepare form fields with dynamic options
  const formFields = useMemo(() => {
    return addReportTypeFields.map(field => {
      if (field.name === "sub_pollution_category_id") {
        return {
          ...field,
          options: [
            { label: "Select Sub-Pollution Category", value: "" },
            ...subPollutionOptions
          ],
          value: form.sub_pollution_category_id // Explicitly pass value
        };
      }
      return field;
    });
  }, [subPollutionOptions, form.sub_pollution_category_id]);

  return (
    <>
      <div className="mb-4">
        {/* Page Title */}
        <div className="flex gap-2 items center mb-2 ">

          <Button color="green"
            onClick={() => window.history.back()}
            className="rounded-full w-10 h-10 "
          >
            <ArrowLeft size={20} />

          </Button>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Report Types</h1>
        </div>
        {/* Tabs + Search + Add */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Left: Tabs */}
          <div className="flex-1">
            <FilterTab
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { key: "reportTypes", label: "Report Types" },
                { key: "formTypes", label: "Form Types" },
                { key: "reportingForms", label: "Reporting Forms" },
              ]}
            />
          </div>

          {/* Right: Search + Add */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search report types..."
              className="w-full lg:w-64"
            />

            <Button color="green" onClick={openAddModal} className="whitespace-nowrap">
              <Plus size={20} />
              <span className="hidden md:inline ml-2">Add Report Type</span>
            </Button>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Loading report types...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No report types found.</p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            rows={rowsWithId}
            actions={actions}
            isonviewdetails={true}
          />
          {totalPages > 1 && (
            <Pagination page={page} total={totalPages} onChange={setPage} />
          )}
        </>
      )}

      <Modal
        key={isEditing ? `edit-${selectedItem?.report_type_id}` : "add-modal"}
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Report Type" : "Add Report Type"}
        width="w-full max-w-2xl"
        actions={[
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="save" color="green" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"}
          </Button>,
        ]}
      >
        <div className="p-1">
          <DynamicForm
            fields={formFields}
            values={form}
            onChange={handleFormChange}
            schema={addReportTypeSchema}
            submitAttempted={submitAttempted}
          />
        </div>
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
        title="Delete Report Type"
        message="Are you sure you want to delete this Report Type? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}