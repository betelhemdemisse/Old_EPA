import { useMemo, useState, useEffect } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
// import addRegionFields from "./addZoneFields.js";
import addRegionSchema from "./addZoneSchema.js";
import { ArrowLeft, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { useNavigate } from "react-router-dom";
import FilterTab from "../../../components/Form/FilterTab.jsx";
import services from "../../../services/basedata.service.js";
const { CityService, RegionService, SubcityService, ZoneService } = services;



const FILTER_CONFIG = {
  city: {
    label: "City",
    addTitle: "Add City",
    editTitle: "Edit City",

    addRegionField: [{
      name: "name",
      label: "City Name",
      type: "text",
      placeholder: "Enter city name",
      required: true,
      grid: 'col-span-6'
    }],
    columns: [
      { Header: "Ref No", accessor: "refNo" },
      { Header: "City Name", accessor: "name" }
    ],
  },
  region: {
    label: "Region",
    addTitle: "Add Region",
    editTitle: "Edit Region",
    addRegionField: [{
      name: "name",
      label: "Region Name",
      type: "text",
      placeholder: "Enter region name",
      required: true,
      grid: 'col-span-6'
    }],
    columns: [
      { Header: "Ref No", accessor: "refNo" },
      { Header: "Region Name", accessor: "name" }
    ],
  },
};

const ADD_SUB_CONFIG = {
  city: {
    label: "Sub City",
    addTitle: "Add Sub City",
    descriptionAdd: "Fill in the details to add a new sub city.",
    addRegionField: [{
      name: "name",
      label: "Sub City Name",
      type: "text",
      placeholder: "Enter sub city name",
      required: true,
      grid: 'col-span-6'
    }],
  },
  region: {
    label: "Zone",
    addTitle: "Add Zone",
    descriptionAdd: "Fill in the details to add a new zone.",
    addRegionField: [{
      name: "name",
      label: "Zone Name",
      type: "text",
      placeholder: "Enter zone name",
      required: true,
      grid: 'col-span-6'
    }],
  },
};

const options = [
  { key: "region", label: "Regions" },
  { key: "city", label: "City Administrations", },
];

export default function ZoneList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [regions, setRegions] = useState([]);
  const [filter, setFilter] = useState("region");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isAddingSub, setIsAddingSub] = useState(false);


  const navigate = useNavigate();

  const activeFilter = FILTER_CONFIG[filter];
  const activeSubFilter = ADD_SUB_CONFIG[filter];
  const addRegionFields = isAddingSub ? activeSubFilter.addRegionField || [] : activeFilter.addRegionField || [];

  const handleFormChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const service = filter === "city" ? CityService : RegionService;
      const response = await (filter === "city" ? service.getAllCities() : service.getAllRegions());
      const transformedData = (response || []).map((item, index) => ({
        id: filter === "city" ? item.city_id : item.region_id,
        refNo: index + 1,
        name: filter === "city" ? item.city_name : item.region_name,
        ...item,
      }));
      setRegions(transformedData);
    } catch (error) {
      console.error(`Error fetching ${filter}s:`, error);
      setToast({ open: true, message: `Failed to fetch ${filter}s`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleAddRegion = () => {
    setSubmitAttempted(false);
    setModalOpen(true);
    setIsEditing(false);
    setSelectedZone(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({});
    setIsEditing(false);
    setSelectedZone(null);
    setIsAddingSub(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const res = addRegionSchema.safeParse(form);
    if (!res.success) {
      alert("Please fix validation errors before saving.");
      return;
    }

    try {
      if (isAddingSub) {
        const service = filter === "city" ? SubcityService : ZoneService;
        const data = filter === "city" ? { subcity_name: form.name, city_id: form.city_id } : { zone_name: form.name, region_id: form.region_id };
        await (filter === "city" ? service.createSubcity(data) : service.createZone(data));
        setToast({ open: true, message: `${activeSubFilter.label} added successfully`, type: "success" });
      } else {
        const service = filter === "city" ? CityService : RegionService;
        const data = filter === "city" ? { city_name: form.name } : { region_name: form.name };
        if (isEditing && selectedZone) {
          await (filter === "city" ? service.updateCity(selectedZone.id, data) : service.updateRegion(selectedZone.id, data));
          setToast({ open: true, message: `${activeFilter.label} updated successfully`, type: "success" });
        } else {
          await (filter === "city" ? service.createCity(data) : service.createRegion(data));
          setToast({ open: true, message: `${activeFilter.label} added successfully`, type: "success" });
        }
      }
      fetchData();
    } catch (error) {
      console.error(`Error saving ${filter}:`, error);
      setToast({ open: true, message: `Failed to save ${filter}`, type: "error" });
    }

    setModalOpen(false);
    setForm({});
    setSubmitAttempted(false);
    setIsEditing(false);
    setSelectedZone(null);
    setIsAddingSub(false);
  };

  const counts = useMemo(() => {
    const c = { all: regions.length };
    regions.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [regions]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return regions;
    return regions.filter((r) => r.name.toLowerCase().includes(q));
  }, [query, regions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);
  console.log(slice, "slice  slice");

  const actions = {
    onEdit: (row) => {
      setIsEditing(true);
      setSelectedZone(row);
      setForm({ name: row.name });
      setSubmitAttempted(false);
      setModalOpen(true);
    },
    onView: (row) => {
      navigate("/base-data/region_city/details", { state: { city_id: row.city_id, region_id: row.region_id } });
    },
    onAdd: (row) => {
      setSelectedZone(row);
      setForm({ name: '', city_id: row.city_id, region_id: row.region_id });
      setSubmitAttempted(false);
      setIsAddingSub(true);
      setModalOpen(true);
    },

    onDelete: (row) => {
      setToDeleteId(row.id);
      setConfirmOpen(true);
    },
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return setConfirmOpen(false);

    try {
      const service = filter === "city" ? CityService : RegionService;
      await (filter === "city" ? service.deleteCity(toDeleteId) : service.deleteRegion(toDeleteId));
      setToast({ open: true, message: `${activeFilter.label} deleted`, type: "success" });
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${filter}:`, error);
      setToast({ open: true, message: `Failed to delete ${filter}`, type: "error" });
    }

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl  p-4">
        <div className="">
          <div>
              <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Address Management
            </h1>
            </div>

          </div>

        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTab
            options={options}
            counts={counts}
            value={filter}
            onChange={setFilter}
            activeColors=""
          />

          <div className="flex items-center gap-2">
            {/* <Button
              variant="outline"
              color="gray"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button> */}

            <div className="flex-1 hidden md:flex items-center justify-between gap-3">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={`Search ....`}
              />
            </div>

            <Button color="green" onClick={handleAddRegion}>
              <Plus />
              <span className="hidden md:flex">{activeFilter.addTitle}</span>
            </Button>
          </div>

        </div>
        <Table isFromBasedata={true} basedataTitle={activeFilter.label.toLowerCase() === "city" ? "subcity" : "zone"} columns={activeFilter.columns} rows={slice} actions={actions} />

        <Modal
          open={modalOpen}
          width="w-full max-w-xl"
          onClose={handleModalClose}
          title={isEditing ? activeFilter.editTitle : (isAddingSub ? activeSubFilter.addTitle : activeFilter.addTitle)}
          description={isEditing ? activeFilter.descriptionEdit : (isAddingSub ? activeSubFilter.descriptionAdd : activeFilter.descriptionAdd)}
          actions={[
            <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose}>
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

        <Pagination page={pageSafe} total={totalPages} onChange={setPage} />

        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />

        <Confirmation
          open={confirmOpen}
          title={`Delete ${activeFilter.label}`}
          message={`This action cannot be undone. Are you sure you want to delete this ${activeFilter.label.toLowerCase()}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
