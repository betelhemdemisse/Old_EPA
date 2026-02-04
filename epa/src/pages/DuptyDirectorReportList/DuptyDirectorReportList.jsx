import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterTab from "../../components/Form/FilterTab.jsx";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import { Import } from "lucide-react";
import SearchInput from "../../components/Form/SearchInput.jsx";
import ReportService from "../../services/report.service.js";
import { MapPin } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";


export default function DuptyDirectorReportList() {
  const navigate = useNavigate();
  const pageSize = 5;
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [userCases, setUserCases] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
    const [allCases, setAllCases] = useState([]); // Store ALL cases separately
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
   const [toast, setToast] = useState({
    open: false,
    type: "",
    message: "",
  });
const defaultreportColumns = useMemo(() => {
  const baseColumns = [
    { Header: "Ref No", accessor: "number" },
    { Header: "Pollution Category ", accessor: "pollution_category" },
     {
     Header: "Location",
     accessor: "location",
     Cell: ( value ) => {
       if (!value || value === "N/A") {
         return (
           <span className="text-sm text-gray-400 italic">
             No location available
           </span>
         );
       }
   
       return (
         <a
           href={value}
           target="_blank"
           rel="noopener noreferrer"
           title={value}
           className="flex items-center gap-1 text-blue-600 hover:underline"
         >
           <MapPin className="w-4 h-4" />
         </a>
       );
     },
   },
    { Header: "Reported Time", accessor: "created_at" },
  ];

  if (filter === "all") {
    baseColumns.push({ Header: "Status", accessor: "status" });
  }

  return baseColumns;
}, [filter]);


  const actions = {
    onView: (row) => {
      console.log("Clicked view for:", row.complaint_id);
      navigate("/dupty_director_reports/detail", { state: { complaint_id: row.complaint_id } });
    },
    onshowForm: (row) => {

      navigate("/dupty_director_reports/expert_form/detail", { state: { case_id: row?._original?.case?.case_id} });
    },
  };

const statusCounts = useMemo(() => {
  const map = {};
  allCases.forEach((c) => {
    if (!c.status) return;
    map[c.status] = (map[c.status] || 0) + 1;
  });
  return map;
}, [allCases]);

    const BellCount = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <span className="relative ml-2">
      🔔
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full px-1">
        {count}
      </span>
    </span>
  );
};
const options = [
  { key: "all", label: "All" },

  {
    key: "Pending",
    label: (
      <div className="flex items-center">
        <span>Pending</span>
        <BellCount count={statusCounts.Pending} />
      </div>
    ),
  },

  {
    key: "Under Review",
    label: (
      <div className="flex items-center">
        <span>Under Review</span>
        <BellCount count={statusCounts["Under Review"]} />
      </div>
    ),
  },

  {
    key: "Verified",
    label: (
      <div className="flex items-center">
        <span>Verified</span>
        <BellCount count={statusCounts.Verified} />
      </div>
    ),
  },

  {
    key: "under_investigation",
    label: (
      <div className="flex items-center">
        <span>Under Investigation</span>
        <BellCount count={statusCounts["Under Investigation"]} />
      </div>
    ),
  },

  {
    key: "investigation_submitted",
    label: (
      <div className="flex items-center">
        <span>Investigated</span>
        <BellCount count={statusCounts["Investigation Submitted"]} />
      </div>
    ),
  },

  {
    key: "authorized",
    label: (
      <div className="flex items-center">
        <span>Authorized</span>
        <BellCount count={statusCounts.Authorized} />
      </div>
    ),
  },

  {
    key: "returned",
    label: (
      <div className="flex items-center">
        <span>Returned</span>
        <BellCount count={statusCounts.Returned} />
      </div>
    ),
  },
];


  console.log("allCases",allCases)

    const investigationSubmittedCount = useMemo(() => {
    const count = allCases.filter(caseItem => {
      return caseItem.caseStatus === "investigation_submitted";
    }).length;
    
    console.log(`Total ALL cases with case.status = "investigation_submitted": ${count}`);
    
    return count;
  }, [allCases]);
  console.log("investigationSubmittedCount",investigationSubmittedCount)

  const activeColors = {
    all: "bg-green-600 text-white",
    Pending: "bg-[#FFAE41] text-white",
    Verified: "bg-blue-100 text-blue-600",
    under_investigation: "bg-indigo-100 text-indigo-600",
    completed: "bg-green-100 text-green-600",
  };
 const loadAllData = async () => {
    try {
      setLoading(true);
      console.log("Loading ALL data...");
      
      // Always fetch all data without any filter
      const res = await ReportService.getAllReportsForDuptyDirector("");
      
      console.log("ALL API Response:", res);
      
      let data = [];
      
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.reports)) {
          data = res.reports;
        } else if (Array.isArray(res)) {
          data = res;
        }
        
        console.log("Total data fetched:", data.length);
        
        if (data.length > 0) {
          const normalized = data.map((item, i) => {
            const pollutionCategory = item.pollution_category?.pollution_category || 
                                     item.pollution_category || 
                                     "N/A";
            
            const location = item.location_url || 
                            item.address || 
                            item.region?.region_name || 
                            item.city?.city_name || 
                            "Unknown";
            
            const displayLocation = location.length > 50 
              ? `${location.substring(0, 50)}...` 
              : location;
            
            const formattedDate = item.created_at 
              ? new Date(item.created_at).toLocaleString() 
              : "Unknown date";
            
            // Get the original status from the API
            let originalStatus = item.status?.trim() || "Unknown";
            
            // Get case status if it exists
            const caseStatus = item.case?.status;
            
            // Map status for display
            const statusMap = {
              'pending': 'Pending',
              'under review': 'Under Review',
              'verified': 'Verified',
              'under_investigation': 'Under Investigation',
              'investigation_submitted': 'Investigation Submitted',
              'authorized': 'Authorized',
              'returned': 'Returned',
              'closed': 'Closed',
            };
            
            const normalizedStatus = statusMap[originalStatus.toLowerCase()] || originalStatus;
            
            return {
              id: item.complaint_id || item.id || i,
              complaint_id: item.complaint_id || item.id,
              number: item.report_id,
              status: normalizedStatus, // For display
              originalStatus: originalStatus, // Original complaint status
              caseStatus: caseStatus, // Store case status separately
              pollution_category: pollutionCategory,
              location: displayLocation,
              created_at: formattedDate,
              location_url: item.location_url,
              _original: item
            };
          });
          setAllCases(normalized);
          setUserCases(normalized);
        } else {
          console.log("No data found in response");
          setAllCases([]);
          setUserCases([]);
        }
      } else {
        console.log("API call unsuccessful:", res?.message || "Unknown error");
        setAllCases([]);
        setUserCases([]);
      }
    } catch (err) {
      console.error("Error loading ALL reports:", err);
      setAllCases([]);
      setUserCases([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAllData();
  }, []);
  const counts = useMemo(() => {
    const c = { all: userCases.length };
    userCases.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [userCases]);

  const filtered = useMemo(() => {
    return userCases.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!query) return true;

      return (
        r.number?.toString().includes(query) ||
        r.complaint_id?.toLowerCase().includes(query.toLowerCase()) ||
        r.pollution_category?.toLowerCase().includes(query.toLowerCase()) ||
        r.location?.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [filter, query, userCases]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const statusParam = filter === "all" ? "" : filter;
      const res = await ReportService.getAllReportsForDuptyDirector(statusParam);
      
      let data = [];
      
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.reports)) {
          data = res.reports;
        } else if (Array.isArray(res)) {
          data = res;
        }
        
        
        if (data.length > 0) {
          const normalized = data.map((item, i) => {
            const pollutionCategory = item.pollution_category?.pollution_category || 
                                     item.pollution_category || 
                                     "N/A";
            
            const location = item.location_url || 
                            item.address || 
                            item.region?.region_name || 
                            item.city?.city_name || 
                            "Unknown";
            
            const displayLocation = location.length > 50 
              ? `${location.substring(0, 50)}...` 
              : location;
            
            const formattedDate = item.created_at 
              ? new Date(item.created_at).toLocaleString() 
              : "Unknown date";
            
            let status = item.status?.trim() || "Unknown";
            const statusMap = {
              'pending': 'Pending',
              'under review': 'Under Review',
              'verified': 'Verified',
              'under investigation': 'under_investigation',
              'authorized': 'authorized',
              'rejected': 'returned',
              'closed': 'closed',
            };
            
            const normalizedStatus = statusMap[status.toLowerCase()] || status;
            
            return {
              id: item.complaint_id || item.id || i,
              complaint_id: item.complaint_id || item.id,
              number: item.report_id || i + 1,
              status: normalizedStatus,
              originalStatus: status,
              pollution_category: pollutionCategory,
              location: displayLocation,
              created_at: formattedDate,
              _original: item
            };
          });
          
          console.log("Normalized data:", normalized); // Debug: log normalized data
          setUserCases(normalized);
        } else {
          console.log("No data found in response");
          setUserCases([]);
        }
      } else {
        console.log("API call unsuccessful:", res?.message || "Unknown error");

        setUserCases([]);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
      setUserCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-col flex-[1] gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">
            Report Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage all reports assigned to you.
          </p>
        </div>
        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3000}
          onClose={() => setToast({ ...toast, open: false })}
        />

        <div className="flex justify-end flex-[2] gap-2 items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search report"
          />
          <Button color="blue">
            <Import className="rotate-180" />
            <span className="hidden md:flex">Export</span>
          </Button>
        </div>
      </div>

      {/* FILTER TABS with notification badge */}
      <div className="relative mb-4">
        <FilterTab
          options={options}
          counts={counts}
          value={filter}
          onChange={setFilter}
          activeColors={activeColors}
        />
        
    
      </div>

      {/* Stats Summary */}
      <div className="mb-4 text-sm text-gray-600">
        <p>
          Showing {filtered.length} of {allCases.length} total reports
          {investigationSubmittedCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {investigationSubmittedCount} investigation(s) submitted
            </span>
          )}
        </p>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="mt-4 text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="mt-4">
          <Table
            columns={defaultreportColumns}
            rows={rows}
            actions={actions}
            isreadonly={true}
          />
        </div>
      )}

      {/* PAGINATION */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4">
          <Pagination
            page={safePage}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      {/* EMPTY STATE */}
     
    </div>
  );
}








