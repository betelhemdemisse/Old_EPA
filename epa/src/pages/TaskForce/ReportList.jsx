import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterTab from "../../components/Form/FilterTab.jsx";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import Select from "../../components/Form/Select.jsx";
import { Import, MapPin } from "lucide-react";
import ComplaintService from "../../services/complaint.service.js";

export default function ReportList() {
  const navigate = useNavigate();
  const pageSize = 5;

  // STATE
  const [handlingUnit, setHandlingUnit] = useState("all");
  const [userCases, setUserCases] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  // HANDLING UNIT OPTIONS
  const handlingUnitOptions = [
    { value: "all", label: "All Handling Units" },
    { value: "temporary_team", label: "Temporary Team" },
    { value: "regional_team", label: "Regional Team" },
    { value: "hq_expert", label: "HQ Expert" },
  ];

  // STATUS NORMALIZATION MAP
  const STATUS_MAP = {
    "under review": "under_review",
    verified: "verified",
    under_investigation: "under_investigation",
    authorized: "authorized",
    closed: "closed",
    pending: "pending",
  };

  const DISPLAY_STATUS = {
    under_review: "Under Review",
    verified: "Verified",
    under_investigation: "Under Investigation",
    authorized: "Authorized",
    closed: "Closed",
    pending: "Pending",
  };

  // ACTIVE COLORS FOR FILTER TABS
  const activeColors = {
    all: "bg-green-600 text-white",
    under_review: "bg-yellow-100 text-yellow-600",
    verified: "bg-blue-100 text-blue-600",
    under_investigation: "bg-indigo-100 text-indigo-600",
    authorized: "bg-green-100 text-green-600",
    pending: "bg-orange-100 text-orange-600",
    closed: "bg-gray-100 text-gray-600",
  };

  // LOAD DATA FROM API
  const loadAssignedComplaints = async () => {
    try {
      const res = await ComplaintService.getAssignedComplaints();
      let data = Array.isArray(res.data)
        ? res.data
        : res.data
        ? [res.data]
        : [];

      const normalized = data.map((item) => {
        let status = item.status ? item.status.trim().toLowerCase() : "pending";

        if (status === "verified" && item.handling_unit === "temporary_team") {
          status = "under_investigation";
        }

        const normalizedStatus = STATUS_MAP[status] || status;

        return {
          number: item.report_id,
          complaint_id: item.complaint_id,
          pollution_category:
            item.pollution_category?.pollution_category || "N/A",
          location_url: item.location_url
            ? item.location_url.length > 50
              ? item.location_url.slice(0, 50) + "..."
              : item.location_url
            : "N/A",
          handling_unit: item.handling_unit || "N/A",
          created_at: item.created_at
            ? new Date(item.created_at).toLocaleString()
            : "Unknown",
          status: normalizedStatus,
        };
      });
      setUserCases(normalized);
    } catch (err) {
      console.error("Error loading assigned complaints:", err);
      setUserCases([]);
    }
  };

  useEffect(() => {
    loadAssignedComplaints();
  }, []);

  // CALCULATE COUNTS FOR BELL
  const counts = useMemo(() => {
    const c = { all: userCases.length };
    userCases.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [userCases]);

  const BellCount = ({ show, count }) => {
    if (!show || !count) return null;
    return (
      <span className="relative ml-2">
        🔔
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
          {count}
        </span>
      </span>
    );
  };

  const options = [
    { key: "all", label: "All" },
    {
      key: "under_review",
      label: (
        <div className="flex items-center">
          <span>Under Review</span>
          <BellCount
            show={counts.under_review > 0}
            count={counts.under_review}
          />
        </div>
      ),
    },
    { key: "verified", label: "Verified" },

    {
      key: "under_investigation",
      label: (
        <div className="flex items-center">
          <span>Under Investigation</span>
        </div>
      ),
    },
    {
      key: "authorized",
      label: (
        <div className="flex items-center">
          <span>Authorized</span>
          <BellCount show={counts.authorized > 0} count={counts.authorized} />
        </div>
      ),
    },
  ];

  // FILTERED DATA
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return userCases.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (handlingUnit !== "all" && r.handling_unit !== handlingUnit)
        return false;
      if (!q) return true;

      return (
        r.number?.toString().toLowerCase().includes(q) ||
        r.complaint_id?.toLowerCase().includes(q) ||
        r.pollution_category?.toLowerCase().includes(q) ||
        r.location_url?.toLowerCase().includes(q)
      );
    });
  }, [filter, handlingUnit, query, userCases]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // TABLE COLUMNS
  const defaultreportColumns = useMemo(() => {
    const baseColumns = [
      { Header: "Ref No", accessor: "number" },
      { Header: "Pollution Category", accessor: "pollution_category" },
      {
        Header: "Location",
        accessor: "location_url",
        Cell: (value) => {
          if (!value) {
            return (
              <span className="text-gray-400 italic text-sm">
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
              className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            >
              <MapPin className="w-4 h-4 text-blue-500" />
            </a>
          );
        },
      },

      { Header: "Reported Time", accessor: "created_at" },
    ];

   if (filter === "all") {
  baseColumns.push({
    Header: "Status",
    accessor: "status",
    Cell: ({ value }) => {
      console.log("valuee", value);
      if (!value) return "-";

      const formatted = value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return <span>{formatted}</span>;
    },
  });
}


    return baseColumns;
  }, [filter]);

  // ACTIONS
  const actions = {
    onView: (row) =>
      navigate("/reports/detail", {
        state: { complaint_id: row.complaint_id },
      }),
  };

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

          <Select
            value={handlingUnit}
            onChange={(val) => {
              setHandlingUnit(val);
              setPage(1);
            }}
            options={handlingUnitOptions}
            placeholder="Select a handling unit"
            className="w-full"
          />
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

      {/* TABLE */}
      <div className="mt-4">
        <Table
          columns={defaultreportColumns}
          rows={rows}
          actions={actions}
          isreadonly
        />
      </div>

      {/* PAGINATION */}
      {filtered.length > 0 && (
        <div className="mt-4">
          <Pagination page={safePage} total={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
