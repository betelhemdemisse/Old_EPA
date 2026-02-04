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


export default function ReportList() {
  const navigate = useNavigate();
  const pageSize = 5;
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [userCases, setUserCases] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [categorySearch , setCategorySearch]= useState([])
const defaultreportColumns = useMemo(() => {
  
  const baseColumns = [
      { Header: "Ref No", accessor: "rowNumber" },
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
    navigate("/reports/detail", { state: { complaint_id: row.complaint_id } });
  },
};


  const options = [
    { key: "all", label: "All" },
    { key: "Pending", label: "Pending" },
    { key: "Verified", label: "Verified" },
    { key: "under_investigation", label: "Under Investigation" },
    { key: "authorized", label: "Authorized" },
    { key: "closed", label: "Closed" },
  
  ];

  const activeColors = {
    all: "bg-green-600 text-white",
    Pending: "bg-yellow-100 text-yellow-600",
    Verified: "bg-blue-100 text-blue-600",
    under_investigation: "bg-indigo-100 text-indigo-600",
    completed: "bg-green-100 text-green-600",
  };

  const loadData = async () => {
    try {
      const res = await ReportService.getLoggedinUserAssignedReports();

      if (res && Array.isArray(res.data)) {
        const normalized = res.data.map((item) => ({
          ...item,
          status: item.status?.trim() || "Unknown",
          pollution_category: item.pollution_category?.pollution_category || "N/A",
          location: item.location_url
            ? item.location_url.length > 50
              ? item.location_url.slice(0, 50) + "..."
              : item.location_url
            : "N/A",
          created_at: new Date(item.created_at).toLocaleString(),
        }));

        setUserCases(normalized);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  useEffect(() => {
    loadData();
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

  const displayedRows = rows.map((item, idx) => ({
    ...item,
    rowNumber: (safePage - 1) * pageSize + idx + 1,
  }));

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Report Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage all reports assigned to you.
          </p>
        </div>
   

        <div className="flex gap-2 items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search report"
          />
      
        </div>
      </div>

      <FilterTab
        options={options}
        counts={counts}
        value={filter}
        onChange={setFilter}
        activeColors={activeColors}
      />

      {/* TABLE */}
      <div className="mt-4">
        <Table
          columns={defaultreportColumns}
          rows={displayedRows}
          actions={actions}
          isreadonly={true}
        />
      </div>

      {/* PAGINATION */}
      {filtered.length > 0 && (
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
