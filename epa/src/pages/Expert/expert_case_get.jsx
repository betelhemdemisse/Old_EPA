import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import ComplaintService from "../../services/complaint.service.js";
import caseService from "../../services/case.service.js";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";
import { jwtDecode } from "jwt-decode";
import OrganizationHierarchyService from "../../services/OrganizationHierarchy.service.js"
import { 
  AlertCircleIcon, 
  Coins, 
  FileTextIcon, 
  Users2, 
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  BadgeAlert,
  ChevronRight
} from "lucide-react";
import { coinsStack } from "@lucide/lab";
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import { useNavigate } from "react-router-dom";
export default function ExpertGetCase() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count,setCount] = useState(0)
  const [pendingCount,setPendingCount] = useState(0)
  const [unopenedCount, setUnopenedCount] = useState(0);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isRegional,setIsRegional] = useState(false);
  const [stats, setStats] = useState({
    pending_count: 0,
    assigned_to_me: 0,
    total_reports: 0,
    last_updated: null
  });
  
  const [toast, setToast] = useState({
    open: false,
    type: "",
    message: "",
  });

  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };
useEffect(() => {
  const loadHierarchy = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      const res = await OrganizationHierarchyService.getHierarchyById(
        decoded.organization_hierarchy_id
      );
      const data = res?.data ?? res;
      console.log("hierarchy data:", data);

      setIsRegional(!!data?.isRegional);
    } catch (err) {
      console.error("Error loading hierarchy:", err);
    }
  };

  loadHierarchy();
}, []);
console.log("IsRegional", isRegional);
const loadAssignedComplaints = async () => {
  try {
    const res = await ComplaintService.getAssignedComplaints();

    const payload = res?.data ?? res;
    let data = Array.isArray(payload) ? payload : payload ? [payload] : [];

    if (!data.length) {
      console.warn("No complaint data found.");
      setCases([]);
      return;
    }

    const normalized = data.map((item) => ({
      complaint_id: item.complaint_id,
      pollution_category: item.pollution_category?.pollution_category || "N/A",
      location_url: item.location_url || "N/A",
      created_at: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown",
      status: item.status ? item.status.trim() : "Unknown",
    }));

    setCases(normalized);
  } catch (err) {
    console.error("Error loading assigned complaints:", err);
  }
};


  useEffect(() => {
    loadAssignedComplaints();
  }, [refreshFlag]);

const fetchExpertCases = async () => {
  setLoading(true);

  try {
    let complaint_id = null;

    if (isRegional) {
      try {
        console.log("Opening regional case...");
        const openRes = await regionalWorkflowService.openRegionalCase();
        if (openRes?.success && openRes.data) {
          complaint_id = openRes.data?.complaint?.complaint_id;
          showToast("success", "Regional case opened!");
        } else {
          showToast("info", "No new regional case available");
        }
      } catch (openErr) {
        console.error("Failed to open regional case:", openErr);
        showToast("error", "Failed to open regional case!");
      }
    } else {
      const res = await caseService.getComplaintForExpert();
      if (res?.success && res?.data) {
        complaint_id = res.data?.complaint_id;
        showToast("success", "New complaint loaded!");
      } else {
        showToast("info", "No new complaint available");
      }
    }

    if (complaint_id) {
      navigate("/expert_case_get/details", { state: { complaint_id } });
    }
  } catch (error) {
    console.error("Error fetching complaint:", error);
    showToast("error", "Failed to fetch complaint!");
  } finally {
    setLoading(false);
  }
};

  const loadCountData = async () => {
    try {
      const res = await caseService.countCaseForExpert();
      console.log("res.length",res.count)
      setPendingCount(res.count)
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };
  const loadUnopenedCount = async () => {
    try {
      const res = await regionalWorkflowService.countUnopenedRegionalCases();
      console.log("ressssyyyy",res)
      setUnopenedCount(res.count);
    } catch (err) {
      console.error("Error loading unopened count:", err);
    }
  };
  const loadData = async () => {
    try {
      if (isRegional) {
        const res = await regionalWorkflowService.getAllAssignedCasesForExpert();
        const payload = res?.data ?? res;
        const arr = Array.isArray(payload) ? payload : payload ? [payload] : [];
        const opened = arr.filter((c) => c.is_opened === true);
        setCount(opened.length);
      } else {
        const res = await caseService.getExpertAssignedComplaints();
        console.log("res.length",res.data.length)
        setCount(res.data.length)
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };
    useEffect(() => {
      loadData();
      loadCountData();
      if (isRegional) loadUnopenedCount();
    }, [isRegional, refreshFlag]);
  const defaultColumns = [
    { Header: "No", accessor: "rowNumber" },
    { Header: "Report Type", accessor: "pollution_category" },
    { Header: "Location", accessor: "location_url" },
    { Header: "Reported Time", accessor: "created_at" },
    { Header: "Status", accessor: "status" },
  ];


  const actions = {
    onView: (row) => {
      alert("Viewing case: " + row.complaint_id);
    },
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let temp = cases;

    if (statusFilter.toLowerCase() !== "all") {
      temp = temp.filter(
        (x) => x.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (!q) return temp;

    return temp.filter(
      (x) =>
        (x.complaint_id || "").toString().toLowerCase().includes(q) ||
        (x.pollution_category || "").toLowerCase().includes(q) ||
        (x.location_url || "").toLowerCase().includes(q) ||
        (x.status || "").toLowerCase().includes(q)
    );
  }, [cases, query, statusFilter]);


  const totalPages = Math.ceil(filtered.length / pageSize);
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  const displayed = slice.map((item, idx) => ({
    ...item,
    rowNumber: (page - 1) * pageSize + idx + 1,
  }));
console.log("unopenedCount",unopenedCount)
console.log("loadingStats",loadingStats)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900"> Expert Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage environmental complaints in real-time</p>
          </div>
        
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Reports Card */}
        {isRegional ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unopened Queue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{unopenedCount || 0} </p>
                  <p className="text-xs text-gray-500 mt-1">Cases awaiting to be opened</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={async () => {
                    setLoading(true);
                      try {
                        await fetchExpertCases();
                      } finally {
                        setLoading(false);
                      }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  <Coins className="h-4 w-4" />
                  View Queue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting assignment</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={fetchExpertCases}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      Get Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

       

          {/* Assigned to Me Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned to Me</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active investigations</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/expert_report_list")}
        
      
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View My Reports
                </button>
              </div>
            </div>
          </div>

          {/* Total Reports Card */}
          <div className="flex p-6 justify-between items-center bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                      {count + pendingCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time reports</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <FileTextIcon className="h-8 w-8 text-green-600" />
                </div>
            
          </div>
        </div>

        {/* Status Message */}
        {stats.pending_count === 0 && isRegional === false && !loadingStats && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">All caught up!</p>
                <p className="text-green-700 text-sm mt-1">
                  There are currently no pending reports waiting in the queue. Great work!
                </p>
              </div>
            </div>
          </div>
        )}
         {unopenedCount === 0 && isRegional === true && !loadingStats && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">All caught up!</p>
                <p className="text-green-700 text-sm mt-1">
                  There are currently no pending reports waiting in the queue. Great work!
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.pending_count > 0 && !loadingStats && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BadgeAlert className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">
                    {stats.pending_count} report{stats.pending_count !== 1 ? 's' : ''} pending assignment
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Click "Get Report" to pick up the next available complaint
                  </p>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full border border-blue-300">
                <span className="text-blue-700 text-sm font-medium">
                  {stats.pending_count} available
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reports Table Section - Only show if there are assigned complaints
        {cases.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">My Assigned Reports</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {slice.length} of {filtered.length} report{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="w-full sm:w-64">
                    <SearchInput
                      value={query}
                      onChange={setQuery}
                      placeholder="Search reports..."
                      className="w-full"
                    />
                  </div>
                  
                  <FilterTab
                    options={[
                      { key: "all", label: "All Status" },
                      { key: "under review", label: "Under Review" },
                      { key: "verified", label: "Verified" },
                      { key: "under_investigation", label: "Under Investigation" },
                      { key: "investigation_submitted", label: "Submitted" },
                      { key: "authorized", label: "Authorized" },
                      { key: "returned", label: "Returned" },
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>

              {slice.length > 0 ? (
                <>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table
                      data={displayed}
                      columns={defaultColumns}
                      actions={actions}
                      isLoading={loading}
                      showHeader={true}
                    />
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 mb-4">
                    <FileTextIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No reports found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {query || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : "No reports match your current filters."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )} */}

      
      </div>

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
