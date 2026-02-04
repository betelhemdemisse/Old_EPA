import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import ComplaintService from "../../services/complaint.service.js";
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
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import { useNavigate } from "react-router-dom";

export default function TaskForceGetCase() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "",
    message: "",
  });
  
  // New states for pending stats
  const [stats, setStats] = useState({
    pending_count: 0,
    assigned_to_me: 0,
    total_reports: 0,
    last_updated: null
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");

  // Get current user ID on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.id || decoded.user_id || decoded.sub);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };

  // Function to get pending statistics
  const fetchPendingStats = async () => {
    setLoadingStats(true);
    try {
      const res = await ComplaintService.getPendingComplaintsCount();
      
      if (res.success) {
        setStats({
          pending_count: res.data.pending_count || 0,
          assigned_to_me: res.data.assigned_to_me || 0,
          total_reports: res.data.total_reports || 0,
          last_updated: res.data.last_updated || new Date().toISOString()
        });
      } else {
        showToast("error", res.message || "Failed to load statistics");
      }
    } catch (error) {
      console.error("Error fetching pending stats:", error);
      showToast("error", "Failed to load statistics. Please try again.");
      
      // Fallback: Use the fallback function
      await fetchPendingStatsFallback();
    } finally {
      setLoadingStats(false);
    }
  };

  // Fallback function if API fails
  const fetchPendingStatsFallback = async () => {
    try {
      // Fallback: Get all complaints and calculate counts
      const allRes = await ComplaintService.getAllComplaints();
      
      if (allRes.data) {
        const complaints = Array.isArray(allRes.data) ? allRes.data : [];
        
        const pendingCount = complaints.filter(c => 
          c.status === "Pending" && !c.accepted_by
        ).length;
        
        const assignedToMeCount = currentUserId ? 
          complaints.filter(c => 
            c.accepted_by === currentUserId && 
            ["Under Review", "Under Investigation", "Verified"].includes(c.status)
          ).length : 0;
        
        setStats({
          pending_count: pendingCount,
          assigned_to_me: assignedToMeCount,
          total_reports: complaints.length,
          last_updated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error in fallback stats:", error);
    }
  };

  const loadAssignedComplaints = async () => {
    try {
      const res = await ComplaintService.getAssignedComplaints();
      console.log("Assigned Complaints Response:", res);

      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data) {
        data = [res.data];
      }

      if (data.length > 0) {
        const normalized = data.map((item, idx) => ({
          number: idx + 1,
          complaint_id: item.complaint_id,
          complaint_code: item.report_id,
          pollution_category: item.pollution_category?.pollution_category || "N/A",
          location_url: item.location_url || "#",
          created_at: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown",
          status: item.status ? item.status.trim() : "Unknown",
          city: item.city?.city_name || "N/A",
          subcity: item.subcity?.subcity_name || "N/A",
          customer_name: item.customer?.full_name || "Anonymous"
        }));
        setCases(normalized);
      } else {
        setCases([]); // Clear cases if no data
      }
    } catch (err) {
      console.error("Error loading assigned complaints:", err);
      showToast("error", "Failed to load assigned complaints");
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPendingStats();
    loadAssignedComplaints();
  }, [refreshFlag, currentUserId]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loadingStats) {
        fetchPendingStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTaskforceCases = async () => {
    if (stats.pending_count === 0) {
      showToast("info", "No pending complaints available");
      return;
    }

    setLoading(true);
    try {
      const res = await ComplaintService.getComplaintForTaskforce();

      if (res?.complaint) {
        showToast("success", "New complaint assigned successfully!");
        
        // Immediately update the pending count
        setStats(prev => ({
          ...prev,
          pending_count: Math.max(0, prev.pending_count - 1),
          assigned_to_me: prev.assigned_to_me + 1
        }));
        
        // Refresh all data after a short delay
        setTimeout(() => {
          setRefreshFlag(prev => !prev);
        }, 1000);
        
        navigate("/reports/detail", {
          state: { complaint_id: res?.complaint?.complaint_id },
        });
      } else {
        showToast("info", "No new complaint available");
        // Refresh stats in case they changed
        fetchPendingStats();
      }
    } catch (error) {
      console.error("Error fetching complaint:", error);
      showToast("error", error.response?.data?.message || "Failed to fetch complaint!");
    }
    setLoading(false);
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchPendingStats();
    loadAssignedComplaints();
    showToast("info", "Refreshing data...");
  };

  // Format status badge with icons
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: <Clock className="w-3 h-3" /> 
      },
      'under review': { 
        color: 'bg-blue-100 text-blue-800 border border-blue-200', 
        icon: <Eye className="w-3 h-3" /> 
      },
      'verified': { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      'under_investigation': { 
        color: 'bg-purple-100 text-purple-800 border border-purple-200', 
        icon: <AlertTriangle className="w-3 h-3" /> 
      },
      'investigation_submitted': { 
        color: 'bg-indigo-100 text-indigo-800 border border-indigo-200', 
        icon: <FileTextIcon className="w-3 h-3" /> 
      },
      'authorized': { 
        color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      'returned': { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: <AlertCircleIcon className="w-3 h-3" /> 
      },
      'closed': { 
        color: 'bg-gray-100 text-gray-800 border border-gray-200', 
        icon: <BadgeAlert className="w-3 h-3" /> 
      },
      'default': { 
        color: 'bg-gray-100 text-gray-800 border border-gray-200', 
        icon: null 
      }
    };

    const key = status.toLowerCase();
    const badge = statusMap[key] || statusMap.default;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {status.replace('_', ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </span>
    );
  };

  const defaultColumns = useMemo(() => {
    const baseColumns = [
      { Header: "#", accessor: "number", width: 50 },
      { 
        Header: "Report ID", 
        accessor: "complaint_code",
        Cell: ({ value }) => (
          <span className="font-mono text-sm font-medium text-gray-900">
            {value}
          </span>
        )
      },
      { 
        Header: "Pollution Category", 
        accessor: "pollution_category",
        Cell: ({ value }) => (
          <span className="text-sm text-gray-700">{value}</span>
        )
      },
      {
        Header: "Location",
        accessor: "location_url",
        Cell: (cellProps) => {
          const fullUrl = cellProps.value || "#";
          return (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={fullUrl}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">View Map</span>
            </a>
          );
        },
      },
      { 
        Header: "Status", 
        accessor: "status", 
        Cell: ({ value }) => getStatusBadge(value) 
      },
      { 
        Header: "Reported", 
        accessor: "created_at",
        Cell: ({ value }) => (
          <span className="text-sm text-gray-600">{value}</span>
        )
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <button
            onClick={() => actions.onView(row.original)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
          >
            View Details
            <ChevronRight className="w-3 h-3" />
          </button>
        ),
        width: 120
      },
    ];

    return baseColumns;
  }, []);

  const actions = {
    onView: (row) => {
      navigate("/reports/detail", {
        state: { complaint_id: row.complaint_id },
      });
    },
    onShowForm: (row) => {
      if (row._original?.case?.case_id) {
        navigate("/dupty_director_reports/expert_form/detail", {
          state: { case_id: row._original.case.case_id },
        });
      }
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
        (x.complaint_code || "").toLowerCase().includes(q) ||
        (x.pollution_category || "").toLowerCase().includes(q) ||
        (x.status || "").toLowerCase().includes(q) ||
        (x.customer_name || "").toLowerCase().includes(q)
    );
  }, [cases, query, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  console

  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Force Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage environmental complaints in real-time</p>
          </div>
        
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Reports Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loadingStats ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      stats.pending_count
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting assignment</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={fetchTaskforceCases}
                  disabled={loading || stats.pending_count === 0}
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

          {/* Assigned to Me Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned to Me</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loadingStats ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      stats.assigned_to_me
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active investigations</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Users2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/task_force_report_list")}
        
      
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View My Reports
                </button>
              </div>
            </div>
          </div>

          {/* Total Reports Card */}
          <div className="bg-white flex items-center rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 w-full">
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                                       { stats.pending_count +  stats.assigned_to_me}

                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time reports</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <FileTextIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Status Message */}
        {stats.pending_count === 0 && !loadingStats && (
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
                      data={slice}
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