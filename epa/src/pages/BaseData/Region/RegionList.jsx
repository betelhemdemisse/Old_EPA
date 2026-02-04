import { useEffect, useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import addRegionFields from "./addRegionFields.js";
import addRegionSchema from "./addRegionSchema.js";
import { ArrowLeft, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import RegionService from "../../../services/region.service";

// Columns
const defaultRegionColumns = [
  { Header: "ID", accessor: "id" },
  { Header: "Region Name", accessor: "region_name" },
  { Header: "Description", accessor: "description" },
];

export default function RegionList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState({ region_name: "", description: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleFormChange = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));

  // Load regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      const result = await RegionService.getAllRegions();
      console.log("fetch region", result);
      
      if (result) setRegions(result);
    };
    fetchRegions();
  }, []);

  const handleAddRegion = () => {
    setSubmitAttempted(false);
    setModalOpen(true);
    setIsEditing(false);
    setSelectedRegion(null);
    setForm({ region_name: "", description: "" });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({ region_name: "", description: "" });
    setIsEditing(false);
    setSelectedRegion(null);
  };

  // CREATE / UPDATE
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const res = addRegionSchema.safeParse(form);
    if (!res.success) {
      alert("Fix validation errors before submitting.");
      return;
    }

    if (isEditing && selectedRegion) {
      // UPDATE region
      const updated = await RegionService.updateRegion(selectedRegion.id, {
        region_name: form.region_name,
        description: form.description,
      });

      if (updated) {
        setToast({
          open: true,
          message: "Region updated successfully",
          type: "success",
        });

        const result = await RegionService.getAllRegions();
        if (result) setRegions(result);
      }
    } else {
      // CREATE region
      const created = await RegionService.createRegion({
        region_name: form.region_name,
        description: form.description,
      });

      if (created) {
        setToast({
          open: true,
          message: "Region added successfully",
          type: "success",
        });

        const result = await RegionService.getAllRegions();
        if (result) setRegions(result);
      }
    }

    handleModalClose();
  };

  // Actions
  const actions = {
    onEdit: (row) => {
      setIsEditing(true);
      setSelectedRegion(row);
      setForm({
        region_name: row.region_name,
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

  // DELETE region
  const handleConfirmDelete = async () => {
    if (!toDeleteId) return setConfirmOpen(false);

    const deleted = await RegionService.deleteRegion(toDeleteId);

    if (deleted) {
      setToast({
        open: true,
        message: "Region deleted successfully",
        type: "success",
      });

      const result = await RegionService.getAllRegions();
      if (result) setRegions(result);
    }

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  // SEARCH + PAGINATION
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return regions;

    return regions.filter(
      (r) =>
        r.region_name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [query, regions]);

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
          <h1 className="text-xl font-semibold">Region Management</h1>
</div>
          <Button color="green" onClick={handleAddRegion}>
            <Plus />
            <span className="hidden md:flex">Add Region</span>
          </Button>
        </div>

        <div className="my-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search regions..."
          />
        </div>

        <Table columns={defaultRegionColumns} rows={slice} actions={actions} />

        <Pagination page={page} total={totalPages} onChange={setPage} />

        <Modal
          open={modalOpen}
          onClose={handleModalClose}
          title={isEditing ? "Edit Region" : "Add Region"}
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
            fields={addRegionFields}
            values={form}
            onChange={handleFormChange}
            schema={addRegionSchema}
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
          title="Delete region"
          message="Are you sure you want to delete this region?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
