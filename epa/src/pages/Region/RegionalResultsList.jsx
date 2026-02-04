import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import FilterTab from "../../components/Form/FilterTab.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";
import { Eye } from "lucide-react";

const STATUS_LABEL = {
  approved_regional: { text: "Approved", className: "bg-emerald-100 text-emerald-800" },
  rejected_regional: { text: "Rejected", className: "bg-red-100 text-red-800" },
  closed: { text: "Closed", className: "bg-blue-100 text-blue-800" },
};

const defaultColumns = [
  { Header: "Ref No", accessor: "case_no" },
  { Header: "Title", accessor: "complaint.title" },
  { Header: "Category", accessor: "complaint.pollution_category.pollution_category" },
  { Header: "Location", accessor: "location" },
  { Header: "Reported", accessor: "created_at" },
  { Header: "Status", accessor: "statusBadge" },
];

export default function RegionalResultsList() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [toast, setToast] = useState({ open: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false }), 4000);
  };

  const fetchClosedCases = async () => {
    setLoading(true);
    try {
      const res = await regionalWorkflowService.getAllAssignedCasesForExpert();
      const data = Array.isArray(res.data) ? res.data : [];

      const closed = data.filter(c =>
        ["approved_regional", "rejected_regional", "closed"].includes(c.status)
      );

      const normalized = closed.map((c, i) => {
        const location = c.complaint.city?.city_name
          ? `${c.complaint.city.city_name}${c.complaint.subcity ? `, ${c.complaint.subcity.subcity_name}` : ''}`
          : `${c.complaint.region?.region_name}${c.complaint.zone ? `, ${c.complaint.zone.zone_name}` : ''}, ${c.complaint.woreda?.name || ''}`;

        return {
          ...c,
          id: c.case_id,
          number: i + 1,
          location: location || "Unknown",
          created_at: new Date(c.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
          }),
          statusBadge: (
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_LABEL[c.status]?.className || "bg-gray-100 text-gray-700"}`}>
              {STATUS_LABEL[c.status]?.text || c.status.replace(/_/g, " ").toUpperCase()}
            </span>
          )
        };
      });

      setCases(normalized);
    } catch (err) {
      showToast("error", "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosedCases();
  }, []);

  const actions = {
    onView: (row) => {
      navigate("/regional/expert/case", {
        state: { complaint_id: row.complaint.complaint_id }
      });
    }
  };

  const options = [
    { key: "all", label: "All Results" },
    { key: "approved_regional", label: "Approved" },
    { key: "rejected_regional", label: "Rejected" },
    { key: "closed", label: "Closed" },
  ];

  const counts = useMemo(() => {
    const c = { all: cases.length };
    cases.forEach(r => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [cases]);

  const filtered = useMemo(() => {
    let result = cases;
    if (filter !== "all") {
      result = result.filter(c => c.status === filter);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c =>
        c.case_no?.toLowerCase().includes(q) ||
        c.complaint?.title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cases, filter, query]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-[1450px] mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Regional Results & Archive</h1>
          <p className="text-lg text-gray-600 mt-2">All finalized regional investigations</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search cases..." className="w-96" />
      </div>

      
      <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 mb-8">
        <div
          className="bg-cover bg-center h-64 flex items-center justify-center relative"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1456&q=80')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
          <div className="relative z-10 text-center text-white px-10">
            <h2 className="text-5xl font-bold mb-4 drop-shadow-2xl">Investigation Archive</h2>
            <p className="text-2xl opacity-95 max-w-4xl mx-auto drop-shadow-lg">
              View all approved, rejected, and closed cases from the regional workflow
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTab
        options={options}
        counts={counts}
        value={filter}
        onChange={setFilter}
        activeColors={{
          all: "bg-emerald-600 text-white",
          approved_regional: "bg-emerald-600 text-white",
          rejected_regional: "bg-red-600 text-white",
          closed: "bg-blue-600 text-white",
        }}
      />

      {/* Table */}
      <div className="mt-8 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <Table
          columns={defaultColumns}
          rows={rows}
          actions={actions}
          loading={loading}
          actionButtons={[{ label: "View Case", onClick: "onView", color: "emerald" }]}
        />
      </div>

      <Pagination page={page} total={totalPages} onChange={setPage} />

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