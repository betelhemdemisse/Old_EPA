import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
// import TaskForceComplaintService from "../../services/TaskForceComplaint.service.js";
import { Eye } from "lucide-react";
// Table Columns
const taskForceComplaintColumns = [
    { Header: "No", accessor: "number" },
    { Header: "Report Type", accessor: "report_type" },
    { Header: "Location", accessor: "location" },
    { Header: "Reported Time", accessor: "reported_time" },
    { Header: "Status", accessor: "status" },
];

export default function TaskForceComplaintList() {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [items, setItems] = useState([]);
    const [toast, setToast] = useState({
        open: false,
        message: "",
        type: "success",
    });

    useEffect(() => {
        const fetchData = async () => {
            const result = await TaskForceComplaintService.getAllComplaints();
            if (result) setItems(result);
        };
        fetchData();
    }, []);

    // Actions (Only view)
    const actions = {
        onView: (row) => {
            alert(`Viewing complaint ID: ${row.id}`);
            // You can implement modal or redirect to detail page here
        },
    };

    // SEARCH + PAGINATION
    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter(
            (r) =>
                r.report_type?.toLowerCase().includes(q) ||
                r.location?.toLowerCase().includes(q) ||
                r.status?.toLowerCase().includes(q)
        );
    }, [query, items]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Task Force Complaint List</h1>
            </div>

            <div className="my-3">
                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search complaints..."
                />
            </div>

            {/* TABLE */}
            <Table
                columns={taskForceComplaintColumns}
                rows={slice}
                actions={actions}
                isreadonly={true} // <-- ensures only Eye (view) is rendered
            />

            <Pagination page={page} total={totalPages} onChange={setPage} />

            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                duration={3500}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
            />
        </>
    );
}
