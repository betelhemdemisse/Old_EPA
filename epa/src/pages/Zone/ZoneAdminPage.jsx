import { useEffect, useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import AssignModal from "../../components/Modal/AssignModal.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";

export default function ZoneAdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [toast, setToast] = useState({ open: false, type: "", message: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalMode, setModalMode] = useState(null);

  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: "", message: "" }), 4000);
  };

  const getDisplayStatus = (complaintStatus, caseStatus) => {
    const status = complaintStatus?.toLowerCase();
    if (status === "verified" && caseStatus === "assigned_to_zone/city") return "Pending";
    if (status === "verified" && caseStatus === "assigned_to_woreda") return "Assigned to Woreda";

    switch (status) {
      case "under_investigation":
        return "Under Investigation";
      case "investigation_submitted":
        return "Investigation Submitted";
      case "authorized":
        return "Authorized";
      case "returned":
        return "Returned";
      case "closed":
        return "Closed";
      default:
        return complaintStatus;
    }
  };

  // Fetch complaints from API
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await regionalWorkflowService.getComplaintForZoneAdmin();
      const payload = res?.data ?? res;
      const normalized = (payload.complaints || []).map((item) => {
        const complaintStatus = item.status?.trim();
        const caseStatus = item.case?.status;
        return {
          number: item.report_id,
          complaint_id: item.complaint_id,
          pollution_category: item.pollution_category?.pollution_category || "N/A",
          location_url: item.location_url || "N/A",
          created_at: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown",
          status: complaintStatus,
          displayStatus: getDisplayStatus(complaintStatus, caseStatus),
          case_id: item.case?.case_id,
          case_status: caseStatus,
        };
      });
      setComplaints(normalized);
    } catch (err) {
      showToast("error", "No complaints assigned to your zone yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleModalConfirm = async ({ organization_hierarchy_id, expert_id }) => {
    if (!modalMode) return;
    const { complaint_id, type } = modalMode;
    try {
      if (type === "woreda") {
        await regionalWorkflowService.assignFromZone({
          complaint_id,
          organization_hierarchy_id,
          assign_to: "woreda",
        });
        showToast("success", "Forwarded to Woreda successfully");
      } else if (type === "expert") {
        await regionalWorkflowService.assignFromZone({
          complaint_id,
          organization_hierarchy_id,
          assign_to: "expert",
          expert_id,
        });
        showToast("success", "Assigned to Zone Expert successfully");
      }
      setModalMode(null);
      fetchComplaints();
    } catch (err) {
      showToast("error", "Assignment failed");
    }
  };

  const columns = [
    { Header: "Ref No", accessor: "number" },
    { Header: "Pollution Category", accessor: "pollution_category" },
    {
      Header: "Location",
      accessor: "location_url",
      Cell: ({ value }) => (
        <a
          href={value || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
        >
          <MapPin className="w-4 h-4 text-blue-500" />
        </a>
      ),
    },
    { Header: "Reported Time", accessor: "created_at" },
  ];

  const actions = {
    onView: (row) => {
      navigate("/regional/zone-detail", { state: { complaint_id: row.complaint_id } });
    },
  };

  // Count only pending complaints
  const pendingCount = useMemo(
    () => complaints.filter((c) => c.displayStatus === "Pending").length,
    [complaints]
  );

  // Filter complaints based on status and search query
  const filtered = useMemo(() => {
    let result = complaints;

    if (statusFilter !== "all") {
      result = result.filter((c) => c.displayStatus === statusFilter);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.pollution_category?.toLowerCase().includes(q) ||
          c.number?.toString().toLowerCase().includes(q) ||
          c.displayStatus?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [complaints, query, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zone Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage complaints forwarded from Region Office</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search in zone..." className="w-96" />
      </div>

      {/* Filter Tabs */}
      <div className="mt-8">
        <FilterTab
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { key: "all", label: "All Complaints" },
            { key: "Pending", label: `Pending (${pendingCount})` }, // show count
            { key: "Assigned to Woreda", label: "Assigned to Woreda" },
            { key: "Under Investigation", label: "Under Investigation" },
            { key: "Investigation Submitted", label: "Investigation Submitted" },
            { key: "Authorized", label: "Authorized" },
            { key: "Returned", label: "Returned" },
            { key: "Closed", label: "Closed" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl shadow-lg overflow-hidden mt-4">
        <Table
          columns={columns}
          rows={paginated}
          isreadonly
          actions={actions}
          loading={loading}
          actionButtons={[
            { label: "To Woreda", onClick: "onAssignWoreda", color: "indigo" },
            { label: "To Expert", onClick: "onAssignExpert", color: "emerald" },
          ]}
        />
      </div>

      {/* Assign Modal */}
      <AssignModal
        open={!!modalMode}
        title={modalMode?.type === "expert" ? "Assign to Expert" : "Assign to Organization"}
        onClose={() => setModalMode(null)}
        fonConfirm={handleModalConfirm}
      />

      {/* Pagination */}
      <Pagination page={page} total={Math.ceil(filtered.length / pageSize)} onChange={setPage} />

      {/* Toast */}
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
