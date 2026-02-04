import { useMemo, useState, useEffect } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import addWoredaFields from "./addWoredaFields.js";
import addWoredaSchema from "./addWoredaSchema.js";
import services from "../../../services/basedata.service.js";
import { ArrowLeft, Import, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { useLocation, useNavigate } from "react-router-dom";

// Table Columns
const defaultWoredaColumns = [
  { Header: "Ref No", accessor: "refNo" },
  { Header: "Woreda Name", accessor: "name" },
];

export default function SubcityOrZoneDetail() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [woredas, setWoredas] = useState([]);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWoreda, setSelectedWoreda] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for force re-fetch
  const location = useLocation();
  const navigate = useNavigate();
  const { subcity_id, zone_id, subcity_name, zone_name } = location.state || {};

  // Fetch woredas on component mount and when ids change
  useEffect(() => {
    const fetchWoredas = async () => {
      setLoading(true);
      try {
        // Fetch all woredas
        const data = await services.WoredaService.getAllWoredas();

        if (data && data.length > 0) {
          // Filter woredas based on zone_id or subcity_id if provided
          let filteredData = data;

          if (zone_id) {
            filteredData = data.filter(woreda => woreda.zone_id === zone_id);
          } else if (subcity_id) {
            filteredData = data.filter(woreda => woreda.subcity_id === subcity_id);
          }

          // Map backend fields to frontend fields
          const mappedWoredas = filteredData.map((woreda, index) => ({
            id: woreda.woreda_id,
            refNo: String(index + 1).padStart(2, '0'),
            name: woreda.woreda_name || woreda.name,
            woreda_id: woreda.woreda_id, // Ensure woreda_id is included
            zone_id: woreda.zone_id,
            subcity_id: woreda.subcity_id,
            isActive: woreda.is_active || woreda.isActive || true,
            created_at: woreda.created_at,
            updated_at: woreda.updated_at,
          }));
          setWoredas(mappedWoredas);
        } else {
          setWoredas([]);
        }
      } catch (error) {
        console.error("Error fetching woredas:", error);
        setToast({ open: true, message: 'Failed to fetch woredas', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchWoredas();
  }, [zone_id, subcity_id, refreshKey]); // Add refreshKey to dependencies

  const handleFormChange = (name, value) => setForm(f => ({ ...f, [name]: value }));

  const handleAddWoreda = () => {
    setSubmitAttempted(false);
    setModalOpen(true);
    setIsEditing(false);
    setSelectedWoreda(null);
    setForm({
      name: '',
      status: 'Active',
      ...(zone_id && { zone_id }),  // Include zone_id if it exists
      ...(subcity_id && { subcity_id })  // Include subcity_id if it exists
    });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({});
    setIsEditing(false);
    setSelectedWoreda(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const res = addWoredaSchema.safeParse(form);
    console.log("form validation", res);

    if (!res.success) {
      const errors = res.error.errors.map(err => err.message).join(', ');
      setToast({ open: true, message: `Validation errors: ${errors}`, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && selectedWoreda) {
        // Edit existing woreda
        const updateData = {
          woreda_name: form.name,
          status: form.status,
          is_active: form.status === 'Active',
          ...(zone_id && { zone_id }),
          ...(subcity_id && { subcity_id }),
        };

        const updatedWoreda = await services.WoredaService.updateWoreda(selectedWoreda.id, updateData);

        if (updatedWoreda) {
          // Force refresh to get updated data from server
          setRefreshKey(prev => prev + 1);
          setToast({ open: true, message: 'Woreda updated successfully', type: 'success' });
        } else {
          setToast({ open: true, message: 'Failed to update woreda', type: 'error' });
        }
      } else {
        // Add new woreda - ensure we pass either zone_id OR subcity_id
        const createData = {
          woreda_name: form.name,
          status: form.status || 'Active',
          is_active: (form.status || 'Active') === 'Active',
        };

        // Add either zone_id or subcity_id (not both, based on context)
        if (zone_id) {
          createData.zone_id = zone_id;
        } else if (subcity_id) {
          createData.subcity_id = subcity_id;
        }

        const newWoreda = await services.WoredaService.createWoreda(createData);
        console.log("newWoreda", newWoreda);

        if (newWoreda) {
          // Force refresh to get fresh data from server
          setRefreshKey(prev => prev + 1);
          setToast({ open: true, message: 'Woreda added successfully', type: 'success' });
        } else {
          setToast({ open: true, message: 'Failed to add woreda', type: 'error' });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setToast({ open: true, message: 'An error occurred while saving', type: 'error' });
    } finally {
      setLoading(false);
    }

    setModalOpen(false);
    setForm({});
    setSubmitAttempted(false);
    setIsEditing(false);
    setSelectedWoreda(null);
  };

  // Filtering logic
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return woredas;
    return woredas.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.woreda_id?.toString().includes(q) ||
        (w.status && w.status.toLowerCase().includes(q)) ||
        w.refNo.toLowerCase().includes(q)
    );
  }, [query, woredas]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const actions = {
    onEdit: (row) => {
      setIsEditing(true);
      setSelectedWoreda(row);
      setForm({
        name: row.name,
        status: row.status || 'Active',
        ...(row.zone_id && { zone_id: row.zone_id }),
        ...(row.subcity_id && { subcity_id: row.subcity_id }),
      });
      setSubmitAttempted(false);
      setModalOpen(true);
    },

    onDelete: (row) => {
      console.log("deleting woreda", row);
      setToDeleteId(row.id || row.woreda_id);
      setConfirmOpen(true);
    },
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) {
      setConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      const deleted = await services.WoredaService.deleteWoreda(toDeleteId);
      console.log("Delete response:", deleted);

      if (deleted) {
        // Force refresh to get updated data from server
        setRefreshKey(prev => prev + 1);
        setToast({ open: true, message: 'Woreda deleted successfully', type: 'success' });
      } else {
        setToast({ open: true, message: 'Failed to delete woreda', type: 'error' });
      }
    } catch (error) {
      console.error("Error deleting woreda:", error);
      setToast({ open: true, message: 'Error deleting woreda', type: 'error' });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleViewDetails = (row) => {
    // Navigate to woreda detail page or show more details
    navigate(`/woredas/${row.id}`, {
      state: {
        woreda_id: row.id,
        woreda_name: row.name,
        zone_id: row.zone_id,
        subcity_id: row.subcity_id,
        zone_name,
        subcity_name
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
              <div className="flex gap-2 items center mb-2 ">
                            
                                          <Button color="green"               
                                          onClick={() => window.history.back()}
                                          className="rounded-full w-10 h-10 "
                            >
                                  <ArrowLeft size={20} />
            
                                                </Button>
            <h1 className="text-xl font-semibold text-gray-900">
               {zone_name ? `${zone_name} - ` : ''}
              {subcity_name ? `${subcity_name} - ` : ''}
              Woreda Management
            </h1>
              </div>
             
            <p className="text-sm text-gray-500">
              Manage woredas {zone_id ? 'in this zone/city' : subcity_id ? 'in this subcity' : 'in the system'}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            

            <div className="flex-1 hidden md:flex items-center justify-between gap-3">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search...."
              />
            </div>
            <Button color="green" onClick={handleAddWoreda} disabled={loading}>
              <Plus />
              <span className="hidden md:flex">Add Woreda</span>
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {loading && woredas.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading woredas...</p>
            </div>
          ) : slice.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500">
                {query ? 'No woredas found matching your search.' : 'No woredas found.'}
              </p>

            </div>
          ) : (
            <Table
              columns={defaultWoredaColumns}
              rows={slice}
              actions={actions}
              onRowClick={handleViewDetails}
              isonviewdetails={true}
            />)}
         
        </div>

        <Modal
          open={modalOpen}
          width="w-full max-w-xl"
          onClose={handleModalClose}
          title={isEditing ? "Edit Woreda" : "Add Woreda"}
          actions={[
            <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose} disabled={loading}>
              Cancel
            </Button>,
            <Button key="save" color="green" onClick={handleFormSubmit} disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? "Update" : "Save")}
            </Button>,
          ]}
        >
          <DynamicForm
            fields={addWoredaFields}
            values={form}
            onChange={handleFormChange}
            schema={addWoredaSchema}
            submitAttempted={submitAttempted}
            disabled={loading}
          />
        </Modal>

        {filtered.length > 0 && (
          <div className="mt-3">
            <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
          </div>
        )}

        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />

        <Confirmation
          open={confirmOpen}
          title="Delete woreda"
          message="This action cannot be undone. Are you sure you want to delete this woreda?"
          confirmLabel={loading ? "Deleting..." : "Delete"}
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
          disabled={loading}
        />
      </div>
    </div>
  );
}