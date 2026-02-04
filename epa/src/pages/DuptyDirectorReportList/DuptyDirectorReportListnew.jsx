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
      Cell: (cellProps) => {
        const data = cellProps.row?._original || cellProps._original || cellProps; 
        const fullUrl = data || "#";
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
      }
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

  const options = [
    { key: "all", label: "All" },
    { key: "Pending", label: "Pending" },
    { key: "Under Review", label: "Under Review" },
    { key: "Verified", label: "Verified" },
    { key: "under_investigation", label: "Under Investigation" },
    { key: "authorized", label: "Authorized" },
    { key: "returned", label: "Returned" },
    { key: "closed", label: "Closed" },
  ];

  const activeColors = {
    all: "bg-green-600 text-white",
    Pending: "bg-[#FFAE41] text-white",
    Verified: "bg-blue-100 text-blue-600",
    under_investigation: "bg-indigo-100 text-indigo-600",
    completed: "bg-green-100 text-green-600",
  };

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
      console.log("Loading data with filter:", filter);
      
      // Check what the API expects
      const statusParam = filter === "all" ? "" : filter;
      const res = await ReportService.getAllReportsForDuptyDirector(statusParam);
      
      console.log("API Response:", res); // Debug: log the full response
      
      // Handle different response structures
      let data = [];
      
      if (res && res.success) {
        // Try different possible data structures
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.reports)) {
          data = res.reports;
        } else if (Array.isArray(res)) {
          data = res;
        }
        
        console.log("Extracted data:", data); // Debug: log extracted data
        
        if (data.length > 0) {
          const normalized = data.map((item, i) => {
            // Get pollution category name
            const pollutionCategory = item.pollution_category?.pollution_category || 
                                     item.pollution_category || 
                                     "N/A";
            
            // Get location
            const location = item.location_url || 
                            item.address || 
                            item.region?.region_name || 
                            item.city?.city_name || 
                            "Unknown";
            
            // Format location for display
            const displayLocation = location.length > 50 
              ? `${location.substring(0, 50)}...` 
              : location;
            
            // Format date
            const formattedDate = item.created_at 
              ? new Date(item.created_at).toLocaleString() 
              : "Unknown date";
            
            // Normalize status
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
              number: i + 1,
              status: normalizedStatus,
              originalStatus: status,
              pollution_category: pollutionCategory,
              location: displayLocation,
              created_at: formattedDate,
              // Include original item for debugging
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

      {/* FILTER TABS */}
      <FilterTab
        options={options}
        counts={counts}
        value={filter}
        onChange={setFilter}
        activeColors={activeColors}
      />

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
    </div>
  );
}