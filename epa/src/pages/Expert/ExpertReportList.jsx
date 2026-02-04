import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterTab from "../../components/Form/FilterTab.jsx";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import { Import, MapPin } from "lucide-react";
import SearchInput from "../../components/Form/SearchInput.jsx";
import CaseService from "../../services/case.service.js";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";

/* -------------------- STATUS MAPPING -------------------- */
const mapStatusToFilterKey = (caseItem) => {
  console.log("Mapping status for caseItem:", caseItem);
  if (caseItem.status === "teamCase") return "teamCase";
  if (caseItem.status === "Returned") return "Returned";

  if (caseItem.complaint?.status === "investigation_submitted")
    return "investigation_submitted";

  if (caseItem.complaint?.status === "under_investigation")
    return "individual_case";

  return "all";
};

const activeColors = {
  all: "bg-green-600 text-white",
  individual_case: "bg-indigo-100 text-indigo-600",
  teamCase: "bg-blue-100 text-blue-600",
  investigation_submitted: "bg-emerald-100 text-emerald-600",
  Returned: "bg-red-100 text-red-600",
};

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

export default function ReportList() {
  const navigate = useNavigate();
  const pageSize = 5;

  /* -------------------- STATE -------------------- */
  const [userCases, setUserCases] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
const statusDisplayMap = {
  under_investigation: "Individual Case",
  individual_case: "Individual Case",
  teamCase: "Team Case",
  investigation_submitted: "Investigation Submitted",
  Returned: "Returned",
};

  /* -------------------- LOAD DATA -------------------- */
  const loadData = async () => {
    try {
      const res = await regionalWorkflowService.getAllAssignedCasesForExpert();
      console.log("resdd",res)
      if (res.data.length) {
        const normalized = res.data
          .map((item) => {
            console.log("Mapping status for item:", item);
            const statusKey = mapStatusToFilterKey(item);
            console.log("statusKey", statusKey);
            return {
              ...item,
              complaint_id:
                item.complaint?.complaint_id ||
                item.complaint_id ||
                item.case_id,
              number: item.complaint?.report_id,
            status: statusKey,
           statusLabel: statusDisplayMap[statusKey] || "All",

              pollution_category: item.complaint?.pollution_category?.pollution_category || "N/A",
              location: item.complaint?.location_url || "N/A",
              created_at: item.created_at
                ? new Date(item.created_at).toLocaleString()
                : "",
              is_opened: !!item.is_opened,
            };
          })
          .filter((it) => it.is_opened === true);
        setUserCases(normalized);
        console.log("Filtered user cases:", normalized);
        return;
      }

      const fallback = await CaseService.getExpertAssignedComplaints();
      if (Array.isArray(fallback.data)) {
        setUserCases(
          fallback.data.map((item) => ({
            ...item,
            status: mapStatusToFilterKey(item),
            number: item.complaint?.report_id,
          }))
        );
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------- COUNTS -------------------- */
  const counts = useMemo(() => {
    const c = {
      all: userCases.length,
      individual_case: 0,
      teamCase: 0,
      investigation_submitted: 0,
      Returned: 0,
    };

    userCases.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [userCases]);

  /* -------------------- FILTER OPTIONS -------------------- */
  const options = useMemo(
    () => [
      {
        key: "all",
        label: (
          <div className="flex items-center">
            <span>All</span>
          </div>
        ),
      },
      {
        key: "individual_case",
        label: (
          <div className="flex items-center">
            <span>Individual Case</span>
            <BellCount
              show={counts.individual_case > 0}
              count={counts.individual_case
}
            />
          </div>
        ),
      },
      {
        key: "teamCase",
        label: (
          <div className="flex items-center">
            <span>Team Case</span>
            <BellCount show={counts.teamCase > 0} count={counts.teamCase} />
          </div>
        ),
      },
      {
        key: "investigation_submitted",
        label: (
          <div className="flex items-center">
            <span>Investigation Submitted</span>
           
          </div>
        ),
      },
      {
        key: "Returned",
        label: (
          <div className="flex items-center">
            <span>Returned</span>
            <BellCount show={counts.Returned > 0} count={counts.Returned} />
          </div>
        ),
      },
    ],
    [counts]
  );

  /* -------------------- FILTER DATA -------------------- */
const filtered = useMemo(() => {
  return userCases.filter((r) => {
    if (filter !== "all" && (r.status || "").trim().toLowerCase() !== filter.toLowerCase())
      return false;

    if (!query) return true;

    return (
      r.complaint_id?.toLowerCase().includes(query.toLowerCase()) ||
      r.pollution_category?.toLowerCase().includes(query.toLowerCase())
    );
  });
}, [filter, query, userCases]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* -------------------- TABLE COLUMNS -------------------- */
  const columns = useMemo(() => {
    const cols = [
      { Header: "Ref No", accessor: "number" },
      { Header: "Pollution Category", accessor: "pollution_category" },
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
  cols.push(
 {
  Header: "Status",
  accessor: "statusLabel",
  Cell: ( value ) => {
    console.log("valuee", value);

    let classes = "bg-gray-100 text-gray-600";

    if (value === "Individual Case") {
      classes = "bg-indigo-100 text-indigo-700";
    } else if (value === "Team Case") {
      classes = "bg-blue-100 text-blue-700";
    } else if (value === "Investigation Submitted") {
      classes = "bg-emerald-100 text-emerald-700";
    } else if (value === "Returned") {
      classes = "bg-red-100 text-red-700";
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>
        {value}
      </span>
    );
  },
}

);
}

    return cols;
  }, [filter]);
console.log("userCase",userCases)
  /* -------------------- RENDER -------------------- */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Report Management</h2>
          <p className="text-sm text-gray-500">
            Manage all reports assigned to you.
          </p>
        </div>

        <div className="flex gap-2">
          <SearchInput value={query} onChange={setQuery} />
          <Button color="blue">
            <Import className="rotate-180" /> Export
          </Button>
        </div>
      </div>

      <FilterTab
        options={options}
        value={filter}
        onChange={setFilter}
        activeColors={activeColors}
      />

      <div className="mt-4">
        <Table
          columns={columns}
          rows={rows}
          actions={{
            onView: (row) =>
              navigate("/expert_case_get/details", {
                state: { complaint_id: row.complaint_id },
              }),
          }}
          isreadonly
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-4">
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
