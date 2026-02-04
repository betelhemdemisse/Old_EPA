import { useEffect, useState, useMemo } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";
import AssignModal from "../../components/Modal/AssignModal.jsx";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WoredaAdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [toast, setToast] = useState({ open: false, type: "", message: "" });
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: "", message: "" }), 4000);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await regionalWorkflowService.getComplaintForWoredaAdmin();
      console.log("redddddds", res);

      const payload = res?.data ?? res;

      const normalized = payload?.complaint.map((item, idx) => ({
        number: item.report_id,
        complaint_id: item.complaint_id,
        pollution_category: item.pollution_category?.pollution_category || "N/A",
        location_url: item.location_url
          ? item.location_url.length > 50
            ? item.location_url.slice(0, 50) + "..."
            : item.location_url
          : "N/A",
        created_at: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown",
        status: item.status ? item.status.trim() : "Unknown",
      }));
      setComplaints(normalized);
    } catch (err) {
      showToast("info", "No complaints assigned to your woreda yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const assignToExpert = async (complaint_id) => {
    setModalMode({ type: "expert", complaint_id });
  };

  const [modalMode, setModalMode] = useState(null);

  const handleModalConfirm = async ({ organization_hierarchy_id, expert_id }) => {
    if (!modalMode) return;
    const { complaint_id, type } = modalMode;
    try {
      if (type === "expert") {
        await regionalWorkflowService.assignToWoredaExpert({ complaint_id, organization_hierarchy_id, expert_id });
        showToast("success", "Assigned to Woreda Expert successfully!");
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
      Cell: (cellProps) => {
        console.log("cellProps", cellProps);
        const fullUrl = cellProps.row?._original || cellProps._original || cellProps;

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

  const actions = {
    onView: (row) => {
      console.log("Clicked view for:", row.complaint_id);
      navigate("/regional/woreda-detail", { state: { complaint_id: row.complaint_id } });
    },
  };

  // Calculate counts for each status
  const counts = useMemo(() => {
    const initial = {
      all: complaints.length,
      Verified: 0,
      under_investigation: 0,
      investigation_submitted: 0,
      authorized: 0,
      returned: 0,
      closed: 0,
    };

    complaints.forEach((c) => {
      const status = c.status;
      if (status === "Verified") initial.Verified++;
      if (status === "under_investigation") initial.under_investigation++;
      if (status === "investigation_submitted") initial.investigation_submitted++;
      if (status === "authorized") initial.authorized++;
      if (status === "returned") initial.returned++;
      if (status === "closed") initial.closed++;
    });

    return initial;
  }, [complaints]);

  // BellCount Component for the filter tabs
  const BellCount = ({ show, count }) => {
    if (!show || count === 0) return null;
    return (
      <span className="relative ml-2">
        <span className="text-xs">🔔</span>
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1 min-w-[16px] flex items-center justify-center">
          {count}
        </span>
      </span>
    );
  };

  // Filter options with bell only for Pending (Verified)
  const filterOptions = [
    { key: "all", label: "All Complaints" },
    {
      key: "Verified",
      label: (
        <div className="flex items-center gap-1">
          <span>Pending</span>
          <BellCount show={counts.Verified > 0} count={counts.Verified} />
        </div>
      ),
    },
    { key: "under_investigation", label: "Under Investigation" },
    { key: "investigation_submitted", label: "Investigation Submitted" },
    { key: "authorized", label: "Authorized" },
    { key: "returned", label: "Returned" },
    { key: "closed", label: "Closed" },
  ];

  // Filtered complaints
  const filtered = useMemo(() => {
    let result = complaints;

    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.number?.toString().toLowerCase().includes(q) ||
        c.pollution_category?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [complaints, query, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Woreda Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Assign to expert</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search complaints..." className="w-96" />
      </div>

      {/* Filter */}
      <div className="mt-8">
        <FilterTab
          value={statusFilter}
          onChange={setStatusFilter}
          options={filterOptions}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl shadow-lg overflow-hidden">
        <Table
          columns={columns}
          rows={paginated}
          actions={actions}
          isreadonly={true}
          loading={loading}
          actionButtons={[
            { label: "Assign to Expert", onClick: "onAssignExpert", color: "emerald" },
          ]}
        />
      </div>

      <AssignModal
        open={!!modalMode}
        title={modalMode?.type === "expert" ? "Assign to Expert" : "Assign to Organization"}
        onClose={() => setModalMode(null)}
        onConfirm={handleModalConfirm}
      />

      <Pagination page={page} total={Math.ceil(filtered.length / pageSize)} onChange={setPage} />

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