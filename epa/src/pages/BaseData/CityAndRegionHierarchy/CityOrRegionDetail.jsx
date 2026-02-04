import { useMemo, useState, useEffect } from "react";
import Table from "../../../components/Table/Table.jsx";
import Pagination from "../../../components/Table/Pagination.jsx";
import SearchInput from "../../../components/Form/SearchInput.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import Modal from "../../../components/Modal/Modal.jsx";
import DynamicForm from "../../../components/Form/DynamicForm.jsx";
import addRegionFields from "./addZoneFields.js";
import addRegionSchema from "./addZoneSchema.js";
import addWoredaFields from "./addWoredaFields.js";
import addWoredaSchema from "./addWoredaSchema.js";
import { ArrowLeft, Plus } from "lucide-react";
import ToastMessage from "../../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../../components/Alerts/Confirmation.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import FilterTab from "../../../components/Form/FilterTab.jsx";
import services from "../../../services/basedata.service.js";

const { SubcityService, ZoneService, WoredaService } = services;

// Filter definitions
const FILTER_CONFIG = {
  sub_city: {
    label: "Subcity",
    addTitle: "Add Subcity",
    editTitle: "Edit Subcity",

    columns: [
      { Header: "Ref No", accessor: "refNo" },
      { Header: "Subcity Name", accessor: "name" },
    ],
  },
  zone: {
    label: "Zone/City",
    addTitle: "Add Zone/City",
    editTitle: "Edit Zone/City",

    columns: [
      { Header: "Ref No", accessor: "refNo" },
      { Header: "Zone/City Name", accessor: "name" },
    ],
  },
};

export default function ZoneDetail() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const location = useLocation();
  const { city_id, region_id } = location.state || {};

  // Build filter options dynamically
  const options = [
    { key: "sub_city", label: "SubCity", disabled: !city_id },
    { key: "zone", label: "Zone/City", disabled: !region_id },
  ];

  const enabledOptions = useMemo(() => {
    return options.filter((o) => !o.disabled);
  }, [options]);

  // Initial filter based on enabled options
  const initialFilter = useMemo(() => {
    return enabledOptions.length > 0 ? enabledOptions[0].key : "sub_city";
  }, [enabledOptions]);

  const [filter, setFilter] = useState(initialFilter);

  // If filter becomes invalid due to disabled options, auto-fix it
  useEffect(() => {
    if (!enabledOptions.some((o) => o.key === filter)) {
      setFilter(enabledOptions[0]?.key || "sub_city");
    }
  }, [enabledOptions, filter]);

  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [cityName, setCityName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [isAddingWoreda, setIsAddingWoreda] = useState(false);


  const [modalOpen, setModalOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchData = async () => {
    // Guard: do not fetch zone before region_id is ready
    if (filter === "sub_city" && !city_id) return;
    if (filter === "zone" && !region_id) return;

    setLoading(true);
    try {
      const isSubCity = filter === "sub_city";
      const service = isSubCity ? SubcityService : ZoneService;

      const response = isSubCity
        ? await service.getAllSubcities()
        : await service.getAllZones();

      const data = isSubCity
        ? response?.subcities || []
        : response?.zones || response || [];

      const filteredData = data.filter((item) =>
        isSubCity ? item.city_id === city_id : item.region_id === region_id
      );

      const transformedData = filteredData.map((item, index) => ({
        id: isSubCity ? item.subcity_id : item.zone_id,
        refNo: String(index + 1).padStart(2, "0"),
        name: isSubCity ? item.name : item.zone_name,
        ...item,
      }));

      setRegions(transformedData);

      if (isSubCity && filteredData[0]?.city) {
        setCityName(filteredData[0].city.city_name);
        setRegionName("");
      } else if (!isSubCity && filteredData[0]?.region) {
        setRegionName(filteredData[0].region.region_name);
        setCityName("");
      } else {
        setCityName("");
        setRegionName("");
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: `Failed to fetch ${filter}s`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, city_id, region_id]);

  const navigate = useNavigate();
  const activeFilter = FILTER_CONFIG[filter];

  const counts = useMemo(() => {
    const c = { all: regions.length };
    regions.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [regions]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? regions.filter((r) => r.name.toLowerCase().includes(q)) : regions;
  }, [query, regions]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const slice = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form handlers
  const handleFormChange = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

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
  };

  const actions = {
    onEdit: (row) => {
      setIsEditing(true);
      setSelectedZone(row);
      setForm({ name: row.name });
      setSubmitAttempted(false);
      setModalOpen(true);
    },
    onView: (row) => {
      navigate("/subcity-region/details", {
        state: { subcity_id: row.subcity_id, zone_id: row.zone_id },
      });
    },
    onAdd: (row) => {
      console.log("adding woreda to", row);
      setSelectedZone(row);
      const isSubCity = filter === "sub_city";
      setForm({
        name: '',
        ...(isSubCity ? { subcity_id: row.id } : { zone_id: row.id })
      });
      setSubmitAttempted(false);
      setIsAddingWoreda(true);
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
      const isSubCity = filter === "sub_city";
      const service = isSubCity ? SubcityService : ZoneService;

      await (isSubCity
        ? service.deleteSubcity(toDeleteId)
        : service.deleteZone(toDeleteId));

      setToast({
        open: true,
        message: `${activeFilter.label} deleted successfully`,
        type: "success",
      });

      fetchData();
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: `Failed to delete ${filter}`,
        type: "error",
      });
    }

    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const schema = isAddingWoreda ? addWoredaSchema : addRegionSchema;
    console.log("form schema", schema.safeParse(form));
    const validation = schema.safeParse(form);
    if (!validation.success) {
      alert("Please fix validation errors before saving.");
      return;
    }

    try {
      if (isAddingWoreda) {
        console.log("adding woreda", form);
        const payload = { woreda_name: form.name, subcity_id: form.subcity_id, zone_id: form.zone_id };
        await WoredaService.createWoreda(payload);
        setToast({
          open: true,
          message: "Woreda added successfully",
          type: "success",
        });
      } else {
        const isSubCity = filter === "sub_city";
        const service = isSubCity ? SubcityService : ZoneService;

        const payload = isSubCity
          ? { subcity_name: form.name, city_id }
          : { zone_name: form.name, region_id };

        if (isEditing && selectedZone) {
          await (isSubCity
            ? service.updateSubcity(selectedZone.id, payload)
            : service.updateZone(selectedZone.id, payload));

          setToast({
            open: true,
            message: `${activeFilter.label} updated successfully`,
            type: "success",
          });
        } else {
          await (isSubCity
            ? service.createSubcity(payload)
            : service.createZone(payload));

          setToast({
            open: true,
            message: `${activeFilter.label} added successfully`,
            type: "success",
          });
        }
      }

      fetchData();
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: `Failed to save ${isAddingWoreda ? "woreda" : filter}`,
        type: "error",
      });
    }

    setModalOpen(false);
    setForm({});
    setSubmitAttempted(false);
    setIsEditing(false);
    setSelectedZone(null);
    setIsAddingSub(false);
    setIsAddingWoreda(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4">


        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          {/* <FilterTab
            options={options}
            counts={counts}
            value={filter}
            onChange={setFilter}
          /> */}
          <div className="mb-4">
              <div className="flex gap-2 items center mb-2 ">
                
                              <Button color="green"               
                              onClick={() => window.history.back()}
                              className="rounded-full w-10 h-10 "
                >
                      <ArrowLeft size={20} />

                                    </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {activeFilter.label} Management {(cityName || regionName) && `- ${cityName || regionName}`}
            </h1>
            </div>
            <p className="text-sm text-gray-500">
              Manage all {activeFilter.label.toLowerCase()}s in the system.
            </p>
          </div>

          <div className="flex items-center gap-2">
            

            <div className="hidden md:flex items-center gap-3">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search ...."
              />
            </div>

            <Button color="green" onClick={handleAddRegion}>
              <Plus />
              <span className="hidden md:flex">{activeFilter.addTitle}</span>
            </Button>
          </div>

        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <Table isFromBasedata={true} basedataTitle="woreda" columns={activeFilter.columns} rows={slice} actions={actions} />
        )}

        <Modal
          open={modalOpen}
          width="w-full max-w-xl"
          onClose={handleModalClose}
          title={
            isAddingWoreda
              ? "Add Woreda"
              : isEditing
                ? activeFilter.editTitle
                : activeFilter.addTitle
          }
          description={
            isAddingWoreda
              ? "Fill in the details to add a new woreda."
              : isEditing
                ? activeFilter.descriptionEdit
                : activeFilter.descriptionAdd
          }
          actions={[
            <Button
              key="cancel"
              variant="outline"
              color="gray"
              onClick={handleModalClose}
            >
              Cancel
            </Button>,
            <Button key="save" color="green" onClick={handleFormSubmit}>
              {isEditing ? "Update" : "Save"}
            </Button>,
          ]}
        >
          <DynamicForm
            fields={isAddingWoreda ? addWoredaFields : addRegionFields}
            values={form}
            onChange={handleFormChange}
            schema={isAddingWoreda ? addWoredaSchema : addRegionSchema}
            submitAttempted={submitAttempted}
          />
        </Modal>

        <Pagination page={currentPage} total={pageCount} onChange={setPage} />

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
