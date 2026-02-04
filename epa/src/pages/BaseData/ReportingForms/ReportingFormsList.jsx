// src/pages/base-data/reporting-form/ReportingFormsList.jsx
import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { Plus } from "lucide-react";
import { ArrowLeft } from "lucide-react";

// Service
import ReportingFormService from "../../../services/reportingForm.service.js";
import FormTypeService from "../../../services/formType.service.js";
import ReportTypeService from "../../../services/reportType.service.js";

// Form Config
import addReportingFormFields from "./addReportingFormFields.js";
import addReportingFormSchema from "./addReportingFormSchema.js";
import FilterTab from "../../../components/Form/FilterTab.jsx";

const columns = [
  { Header: "No.", accessor: "displayId" },
  { Header: "Form Name", accessor: "report_form" },
  { Header: "Input Type", accessor: "input_type" },
  {
    Header: "Required",
    accessor: "required",
    Cell: ({ value }) => (value ? "Yes" : "No"),
  },
];

export default function ReportingFormsList({ activeTab, setActiveTab }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formTypes, setFormTypes] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);


  const [form, setForm] = useState({
    report_form: "",
    input_type: "text",
    options: [],
    required: true,
    form_type_id: "",
    report_type_id: "",
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // ---------------- Fetch ----------------
  const fetchReportingForms = async () => {
    const res = await ReportingFormService.getAllReportingForms();
    if (res) setItems(res);
  };

  useEffect(() => {
    fetchReportingForms();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch reporting forms
        await fetchReportingForms();

        // Fetch form types
        const formTypeRes = await FormTypeService.getAllFormTypes();
        console.log("form form types:", formTypeRes);

        // Fetch report types
        const reportTypeRes = await ReportTypeService.getAllReportTypes();
        console.log("reporting form types:", reportTypeRes);

        // Update state
        if (formTypeRes) setFormTypes(formTypeRes);
        if (reportTypeRes) setReportTypes(reportTypeRes);

      } catch (error) {
        console.error("Error loading form/report types:", error);
      }
    };

    loadData();
  }, []);


  // ---------------- Form handlers ----------------
  const handleFormChange = (name, value) => {
    setForm(prev => {
      // If the user is editing options in string form (temporary UI)
      if (name === "options") {
        // Convert simple "aa" → [{ label: "aa", value: "aa" }]
        if (typeof value === "string") {
          return {
            ...prev,
            options: value.trim() === "" ? [] : [
              {
                label: value,
                value: value.toLowerCase().replace(/\s+/g, "_")
              }
            ]
          };
        }
      }

      // Clear options if input_type doesn’t use options
      if (name === "input_type" &&
        !["select", "radio", "checkbox"].includes(value)) {
        return { ...prev, [name]: value, options: [] };
      }

      return { ...prev, [name]: value };
    });
  };



  const openAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setForm({
      report_form: "",
      input_type: "text",
      options: [],
      required: true,
      form_type_id: "",
      report_type_id: "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };


  const openEditModal = (row) => {
    setIsEditing(true);
    setSelectedItem(row);
    setForm({
      report_form: row.report_form || "",
      input_type: row.input_type || "text",
      options: Array.isArray(row.options) ? row.options : [],
      required: row.required ?? true,
      form_type_id: row.form_type_id || "",
      report_type_id: row.report_type_id || "",
    });
    setSubmitAttempted(false);
    setModalOpen(true);
  };


  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSelectedItem(null);
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Zod validation
    const validation = addReportingFormSchema.safeParse(form);
    // if (!validation.success) {
    //   setToast({
    //     open: true,
    //     message: "Please fix form errors",
    //     type: "error",
    //   });
    //   return;
    // }

    // 🔥 Normalize before sending to backend
    let normalizedForm = { ...form };

    // --- Ensure options is always an array ---
    if (!Array.isArray(normalizedForm.options)) {
      normalizedForm.options = [];
    }

    // --- Convert [{label, value}] → ["Sedan", "SUV"] ---
    normalizedForm.options = normalizedForm.options.map(opt => {
      if (typeof opt === "string") return opt;      // Already a string
      return opt.label || "";                       // Extract string label
    }).filter(opt => opt.trim() !== "");            // Remove empty strings


    let success;

    if (isEditing && selectedItem) {
      if (!selectedItem.report_form_id) {
        setToast({
          open: true,
          message: "Invalid reporting form ID",
          type: "error",
        });
        return;
      }

      success = await ReportingFormService.updateReportingForm(
        selectedItem.report_form_id,
        normalizedForm
      );
    }
    else {
      success = await ReportingFormService.createReportingForm(normalizedForm);
    }

    if (success) {
      await fetchReportingForms();
      closeModal();
      setToast({
        open: true,
        message: isEditing
          ? "Reporting form updated successfully"
          : "Reporting form created successfully",
        type: "success",
      });
    } else {
      setToast({ open: true, message: "Operation failed", type: "error" });
    }
  };



  // ---------------- Delete ----------------
  const handleDelete = (row) => {
    setToDeleteId(row.reporting_form_id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const success =
      toDeleteId &&
      (await ReportingFormService.deleteReportingForm(toDeleteId));

    setToast({
      open: true,
      message: success ? "Deleted successfully" : "Delete failed",
      type: success ? "success" : "error",
    });

    if (success) await fetchReportingForms();
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const actions = {
    onEdit: openEditModal,
    onDelete: handleDelete,
  };

  // ---------------- Search + pagination ----------------
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((i) =>
      i.report_form?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const sliced = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const rowsWithId = sliced.map((row, idx) => ({
    ...row,
    displayId: (page - 1) * pageSize + idx + 1,
  }));

  // ---------------- UI ----------------
  return (
    <>
      <div className="mb-4">
        <div className="flex gap-2 items center mb-2 ">

          <Button color="green"
            onClick={() => window.history.back()}
            className="rounded-full w-10 h-10 "
          >
            <ArrowLeft size={20} />

          </Button>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Reporting Forms
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          {/* Right: Search + Button */}
          <div className="flex gap-3 items-center w-full lg:w-auto">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search reporting forms..."
              className="w-full lg:w-64"
            />

            <Button color="green" onClick={openAddModal} className="whitespace-nowrap">
              <Plus size={20} />
              <span className="hidden md:inline ml-2">Add Reporting Form</span>
            </Button>
          </div>
        </div>

      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reporting forms found.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} rows={rowsWithId} actions={actions} isonviewdetails={true} />
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? "Edit Reporting Form" : "Add Reporting Form"}
        width="w-full max-w-lg md:max-w-2xl lg:max-w-3xl"
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
          fields={addReportingFormFields}
          values={form}
          onChange={handleFormChange}
          schema={addReportingFormSchema}
          submitAttempted={submitAttempted}
          options={{
            formTypes: formTypes.map(f => ({
              label: f.form_type,
              value: f.form_type_id
            })),
            reportTypes: reportTypes.map(r => ({
              label: r.report_type,
              value: r.report_type_id
            })),
          }}
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
        title="Delete Reporting Form"
        message="Are you sure you want to delete this reporting form?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
