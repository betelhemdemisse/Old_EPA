// ...existing code...
import React, { useMemo, useState, useEffect } from "react";
import FilterTab from "../../components/Form/FilterTab.jsx";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import { Import, Eye } from "lucide-react";
import SearchInput from "../../components/Form/SearchInput.jsx";
import complaintService from "../../services/complaint.service.js";
import { useNavigate } from "react-router-dom";

const defaultreportColumns = [
  { Header: "Ref No", accessor: "id" },
  { Header: "Pollution Category", accessor: "pollutionCategory" },
  { Header: "Location", accessor: "location" },
  { Header: "Reported Time", accessor: "time" },
  { Header: "Status", accessor: "status" },

];

const STATUS_LABEL = {
  closed: { text: "Closed", className: "bg-[#2563EB] text-white" },
  rejected: { text: "Rejected", className: "bg-[#9B1C1C] text-white" },
  pending: { text: "Pending", className: "bg-yellow-100 text-yellow-800" },
  verified: { text: "Verified", className: "bg-green-100 text-green-800" },
  "under_investigation": { text: "Under Investigation", className: "bg-purple-100 text-purple-800" },
  "under_review": { text: "Under Review", className: "bg-blue-100 text-blue-800" },
  authorized: { text: "Authorized", className: "bg-indigo-100 text-indigo-800" },
};

export default function ResultsList() {
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("closed");
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("");
  const navigate = useNavigate();

   const actions = {
    onView: (row) => {
      console.log("Clicked view for:", row?.rawData?.complaint_id
);
      navigate("/reports/detail", { state: { complaint_id: row?.rawData?.complaint_id } });
    },
    onshowForm: (row) => {

      navigate("/dupty_director_reports/expert_form/detail", { state: { case_id: row?._original?.case?.case_id} });
    },
  };


const options = [
  { key: "closed", label: "Closed" },
  { key: "rejected", label: "Rejected" }
];

  // activeColors mapping uses same colors as status badges
  const activeColors = {
    all: "bg-green-600 text-white",
    pending: "bg-yellow-500 text-white",
    verified: "bg-green-500 text-white",
    under_investigation: "bg-purple-500 text-white",
    authorized: "bg-indigo-500 text-white",
    closed: "bg-[#2563EB] text-white",
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get location from the data
  const getLocation = (report) => {
    if (report.city?.city_name) {
      return `${report.city.city_name}${report.subcity ? `, ${report.subcity.subcity_name}` : ''}${report.woreda ? `, ${report.woreda.woreda_name}` : ''}`;
    } else if (report.region?.region_name) {
      return `${report.region.region_name}${report.zone ? `, ${report.zone.zone_name}` : ''}${report.woreda ? `, ${report.woreda.woreda_name}` : ''}`;
    }
    return "Location not specified";
  };

  // Map API data to table format
  const mapReportsData = (apiData) => {
    return apiData.map((report, index) => ({
      id: report.report_id || `REP-${index + 1}`,
      type: report.pollution_category?.pollution_category || "Unknown",
      location: getLocation(report),
      time: formatDate(report.created_at),
      status: report.status?.toLowerCase() || "pending",
      pollutionCategory: report.pollution_category?.pollution_category || "N/A",
      subCategory: report.sub_pollution_category?.sub_pollution_category || "N/A",
      rawData: report // Store original data for viewing
    }));
  };

  const handleViewReport = (row) => {
    navigate(`/reports/detail/${row.id}`, { state: { report: row.rawData } });
  };

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await complaintService.getAllComplaints();
        if (response && response.data) {
          const mappedData = mapReportsData(response.data);
          setReports(mappedData);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
console.log("reportsddd",reports)
  const counts = useMemo(() => {
    const c = { all: reports.length };
    reports.forEach((r) => {
      const status = r.status?.toLowerCase();
      c[status] = (c[status] || 0) + 1;
    });
    return c;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    const categoryQ = (categorySearch || "").toLowerCase().trim();
    const statusQ = (statusSearch || "").toLowerCase().trim();
    
    return reports.filter((r) => {
      // Status filter
      if (filter !== "all" && r.status !== filter) return false;
      
      // Search query filter
      if (q && !(
        (r.id || "").toLowerCase().includes(q) ||
        (r.type || "").toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q) ||
        (r.pollutionCategory || "").toLowerCase().includes(q)
      )) return false;
      
      // Category search filter
      if (categoryQ && !(
        (r.type || "").toLowerCase().includes(categoryQ) ||
        (r.pollutionCategory || "").toLowerCase().includes(categoryQ) ||
        (r.subCategory || "").toLowerCase().includes(categoryQ)
      )) return false;
      
      // Status search filter
      if (statusQ && !(
        (r.status || "").toLowerCase().includes(statusQ)
      )) return false;
      
      return true;
    });
  }, [filter, query, reports, categorySearch, statusSearch]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  // adapt rows for Table component (adds formatted status cell)
  const rows = slice.map((r) => ({
    ...r,
    status: (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${STATUS_LABEL[r.status]?.className || "bg-gray-100 text-gray-700"}`}>
        {STATUS_LABEL[r.status]?.text ?? r.status.charAt(0).toUpperCase() + r.status.slice(1)}
      </span>
    ),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-col flex-[1] gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">
            Archive Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage all Archives.
          </p>
        </div>
     
      </div>

      <div className="mb-4">
        <FilterTab
          options={options}
          counts={counts}
          value={filter}
          onChange={(k) => {
            setFilter(k);
            setPage(1);
          }}
          activeColors={activeColors}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <Table 
              columns={defaultreportColumns} 
              rows={rows} 
              actions={actions} 
              isreadonly={true} 
            />
          </div>

          <div className="mt-4">
            <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
          </div>
          
       
        </>
      )}
    </div>
  );
}