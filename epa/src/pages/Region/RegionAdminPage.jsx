/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { coinsStack } from "@lucide/lab";
import { Icon } from "lucide-react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";
import AssignModal from "../../components/Modal/AssignModal.jsx";
import { Import, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegionAdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [toast, setToast] = useState({ open: false, type: "", message: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: "", message: "" }), 4000);
  };
const activeColors = {
  Pending: "bg-yellow-100 text-yellow-600",
  "Assigned to Zone/City": "bg-blue-100 text-blue-600",
  "Assigned to Woreda": "bg-indigo-100 text-indigo-600",
  Verified: "bg-green-100 text-green-600",
  all: "bg-green-600 text-white",
};

const fetchComplaints = async () => {
  setLoading(true);
  try {
    const res = await regionalWorkflowService.getComplaintForRegionAdmin();
    const payload = res?.data ?? res;

    const normalized = (payload.complaints || []).map((item) => {
  let complaintStatus = item.status?.trim();
  const caseStatus = item.case?.status;
  let displayStatus = complaintStatus;

  if (complaintStatus === "Verified") {
    if (caseStatus === "assigned_to_region") displayStatus = "Pending";
    else if (caseStatus === "assigned_to_zone/city") displayStatus = "Assigned to Zone/City";
    else if (caseStatus === "assigned_to_woreda") displayStatus = "Assigned to Woreda";
  }

  return {
    number: item.report_id,
    complaint_id: item.complaint_id,
    pollution_category: item.pollution_category?.pollution_category || "N/A",
    location_url: item.location_url || "N/A",
    created_at: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown",
    status: displayStatus, // <--- use this
    case_id: item.case?.case_id,
    case_status: caseStatus,
  };
});

console.log("normalized",normalized)
    setComplaints(normalized);
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("error", error.response?.data?.message || "Failed to load complaints");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchComplaints();
  }, []);
  const assignToZone = async (complaint_id) => {
    setModalMode({ type: "zone", complaint_id });
  };

  const assignToExpert = async (complaint_id) => {
    setModalMode({ type: "expert", complaint_id });
  };

  const [modalMode, setModalMode] = useState(null);

  const handleModalConfirm = async ({ organization_hierarchy_id, expert_id }) => {
    if (!modalMode) return;
    const { complaint_id, type } = modalMode;
    try {
      if (type === "zone") {
        await regionalWorkflowService.assignFromRegion({ complaint_id, organization_hierarchy_id, assign_to: "zone" });
        showToast("success", "Assigned to Zone Admin");
      } else if (type === "expert") {
        await regionalWorkflowService.assignFromRegion({ complaint_id, organization_hierarchy_id, assign_to: "expert", expert_id });
        showToast("success", "Assigned to Regional Expert");
      }
      setModalMode(null);
      fetchComplaints();
    } catch (err) {
      showToast("error", "Assignment failed");
    }
  };

const baseColumns = [
  { Header: "Ref No", accessor: "number" },
  { Header: "Pollution Category", accessor: "pollution_category" },
  {
    Header: "Location",
    accessor: "location_url",
    Cell: (cellProps) => {
      const fullUrl = cellProps.row?._original?.location_url;
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={fullUrl}
          className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
        >
          <MapPin className="w-4 h-4 text-blue-500" />
        </a>
      );
    },
  },
  { Header: "Reported Time", accessor: "created_at" },
];
const columns = useMemo(() => {
  if (statusFilter === "all") {
    return [
      ...baseColumns,
      { Header: "Status", accessor: "status" }, // <--- use 'status'
    ];
  }
  return baseColumns;
}, [statusFilter]);


  const actions = {
  onView: (row) => {
    console.log("Clicked view for:", row.complaint_id);
    navigate("/reports/regional/detail", { state: { complaint_id: row.complaint_id } });
  },
  onshowForm: (row) => {
console.log("reow",row)
      navigate("/dupty_director_reports/expert_form/detail", { state: { case_id: row?.case_id} });
    },
};

const filtered = useMemo(() => {
  let result = complaints;

  if (statusFilter !== "all") {
    result = result.filter(c => c.status === statusFilter);
  }

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(c =>
      c.pollution_category?.toLowerCase().includes(q) ||
      c.number?.toString().toLowerCase().includes(q)
    );
  }

  return result;
}, [complaints, query, statusFilter]);
const pendingCount = useMemo(() => {
  return complaints.filter(c => c.status === "Pending").length;
}, [complaints]);


  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Region Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Pull and assign verified complaints</p>
        </div>
        <SearchInput 
          value={query} 
          onChange={setQuery} 
          placeholder="Search by title, category, woreda..." 
          className="w-96" 
        />
      </div>

    

      {/* Filter */}
  <FilterTab
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { key: "all", label: "All Complaints" },

    {
      key: "Pending",
      label: (
        <div className="flex items-center gap-2">
          <span>Pending</span>

          {pendingCount > 0 && (
            <span className="relative">
              🔔
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {pendingCount}
              </span>
            </span>
          )}
        </div>
      ),
    },

    { key: "Assigned to Zone/City", label: "Assigned to Zone/City" },
    { key: "Assigned to Woreda", label: "Assigned to Woreda" },

    { key: "under_investigation", label: "Under Investigation" },
    { key: "investigation_submitted", label: "Investigation Submitted" },
    { key: "authorized", label: "Authorized" },
    { key: "returned", label: "Returned" },
    { key: "closed", label: "Closed" },
  ]}
/>

      {/* Table */}
      <div className="rounded-3xl shadow-xl  overflow-hidden">
      <Table
  columns={columns}
  rows={paginated}
  actions={actions}
  isreadonly={true} 
  loading={loading}
  activeColors={activeColors}
/>

      </div>

        <AssignModal
          open={!!modalMode}
          title={modalMode?.type === "expert" ? "Assign to Expert" : "Assign to Organization"}
          onClose={() => setModalMode(null)}
          onConfirm={handleModalConfirm}
        />

      <Pagination 
        page={page} 
        total={Math.ceil(filtered.length / pageSize)} 
        onChange={setPage} 
      />

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={4000}
        onClose={() => setToast({ open: false })}
      />
    </div>
  );
}