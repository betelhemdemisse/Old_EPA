import { useMemo, useState } from "react";
import Table from "../../../components/Table/Table.jsx"
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import addRegionFields from "./addZoneFields.js";
import addRegionSchema from "./addZoneSchema.js";
import { Import, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";

// Mock Data
const REGIONS = [
  { id: "r-001", refNo: "01", name: "Addis Ababa",  isActive: true },
  { id: "r-002", refNo: "02", name: "Dire Dawa", isActive: true },
  { id: "r-003", refNo: "03", name: "Oromia",  isActive: true },
  { id: "r-004", refNo: "04", name: "Amhara",  isActive: true },
  { id: "r-005", refNo: "05", name: "Tigray", isActive: false },
  { id: "r-006", refNo: "06", name: "SNNPR", isActive: true },
  { id: "r-007", refNo: "07", name: "Afar",  isActive: true },
  { id: "r-008", refNo: "08", name: "Somali", isActive: true },
  { id: "r-009", refNo: "09", name: "Benishangul-Gumuz", isActive: true },
  { id: "r-010", refNo: "10", name: "Gambela",  isActive: true },
  { id: "r-011", refNo: "11", name: "Harari", isActive: true },
];

// Table Columns
const defaultRegionColumns = [
  { Header: "Ref No", accessor: "refNo" },
  { Header: "Region Name", accessor: "name" },
];

export default function ZoneList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [regions, setRegions] = useState(REGIONS);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const handleFormChange = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const handleAddRegion = () => { setSubmitAttempted(false); setModalOpen(true); setIsEditing(false); setSelectedZone(null); };
  const handleModalClose = () => { setModalOpen(false); setForm({}); setIsEditing(false); setSelectedZone(null); };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const res = addRegionSchema.safeParse(form);
    if (!res.success) {
      alert('Please fix validation errors before saving.');
      return;
    }

    if (isEditing && selectedZone) {
      // Edit existing zone
      setRegions((r) =>
        r.map((region) =>
          region.id === selectedZone.id
            ? {
                ...region,
                name: form.name,
              }
            : region
        )
      );
      setToast({ open: true, message: 'Zone/City updated successfully', type: 'success' });
    } else {
      // Add new zone
      const newRegion = {
        id: `r-${Date.now()}`,
        refNo: String(regions.length + 1).padStart(2, '0'),
        name: form.name || 'Unnamed',
        isActive: true,
      };
      setRegions((r) => [newRegion, ...r]);
      setToast({ open: true, message: 'Zone/City added successfully', type: 'success' });
    }
    setModalOpen(false);
    setForm({});
    setSubmitAttempted(false);
    setIsEditing(false);
    setSelectedZone(null);
  };

  // Filtering logic
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return regions;
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(q) 
    );
  }, [query, regions]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const actions = {
    onEdit: (row) => {
      setIsEditing(true);
      setSelectedZone(row);
      setForm({
        name: row.name,
      });
      setSubmitAttempted(false);
      setModalOpen(true);
    },
    onView: (row) => alert(`View ${row.name}`),
    onDelete: (row) => {
      // open confirmation modal
      setToDeleteId(row.id);
      setConfirmOpen(true);
    },
  };

  const handleConfirmDelete = () => {
    if (!toDeleteId) return setConfirmOpen(false);
    setRegions((r) => r.filter((x) => x.id !== toDeleteId));
    setConfirmOpen(false);
    setToDeleteId(null);
    setToast({ open: true, message: 'Region deleted', type: 'success' });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Zone/City Management</h1>
            <p className="text-sm text-gray-500">
              This is the zone/City management of the Super professional EPA system.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 hidden md:flex items-center justify-between gap-3">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search..."
              />
            </div>
            <Button color="green" onClick={handleAddRegion}>
              <Plus />
              <span className="hidden md:flex">Add Zone/City</span>
            </Button>
           
          </div>
        </div>

        <div className="mt-4">
          <Table columns={defaultRegionColumns} rows={slice} actions={actions} />
        </div>
        <Modal
          open={modalOpen}
          onClose={handleModalClose}
          title={isEditing ? "Edit Zone/City" : "Add Zone/City"}
          description={isEditing ? "Update the zone/city details." : "Fill in the details to add a new zone/city."}
          actions={[
            <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose}>Cancel</Button>,
            <Button key="save" color="green" onClick={handleFormSubmit}>{isEditing ? "Update" : "Save"}</Button>,
          ]}
        >
          <DynamicForm fields={addRegionFields} values={form} onChange={handleFormChange} schema={addRegionSchema} submitAttempted={submitAttempted} />
        </Modal>
        <div className="mt-3">
          <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
        </div>
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
          message="This action cannot be undone. Are you sure you want to delete this region?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
