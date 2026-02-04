import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import FilterTab from "../../components/Form/FilterTab.jsx"
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import CustomerService from "../../services/customer.service.js";

export default function CustomerList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [userType, setUserType] = useState("all");
  const pageSize = 5;
  const [customers, setCustomers] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const userTypeOptions = [
    { key: "all", label: "All Users" },
    { key: "guest", label: "Guest Users" },
    { key: "registered", label: "Registered Users" },
  ];

  const fetchCustomers = async () => {
    const result = await CustomerService.getAllCustomers();
    if (!result) return;

    const sorted = [...result].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const normalized = sorted.map((item, i) => ({
      refNo: i + 1,
      customer_id: item.customer_id,
      full_name: item.full_name,
      email: item.email,
      account_status: item.account_status ? "Active" : "Inactive",
      status: item.account_status,
      is_guest: item.is_guest,
      created_at: item.created_at,
    }));

    setCustomers(normalized);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer) => {
    try {
      let res;
      if (customer.status === true) {
        res = await CustomerService.deactiveCustomer(customer.customer_id);
      } else {
        res = await CustomerService.activeCustomer(customer.customer_id);
      }

      if (res) {
        setCustomers(prev =>
          prev.map(u =>
            u.customer_id === customer.customer_id
              ? { ...u, status: !u.status }
              : u
          )
        );
        await fetchCustomers();
        setToast({
          open: true,
          message: `Customer ${customer.account_status ? "deactivated" : "activated"} successfully`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      setToast({
        open: true,
        message: "Failed to update customer status",
        type: "error",
      });
    }
  };

  const defaultCustomerColumns = [
    { Header: "No.", accessor: "rowNumber" },
    { Header: "Customer Name", accessor: "full_name" },
    { Header: "Email", accessor: "email" },
    { 
      Header: "User Type", 
      accessor: "is_guest",
      Cell: (cellValue) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cellValue ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {cellValue ? "Guest" : "Registered"}
        </span>
      )
    },
    {
      Header: "Account Status",
      accessor: "account_status",
      Cell: (cellValue, row) => {
        const isActive = typeof cellValue === "string" && cellValue.trim().toLowerCase() === "active";
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={() => handleToggleStatus(row)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-full transition-transform shadow"></div>
          </label>
        );
      }
    }
  ];

  const filtered = useMemo(() => {
    let filteredCustomers = customers;
    
    // Filter by user type
    if (userType === "guest") {
      filteredCustomers = filteredCustomers.filter(cust => cust.is_guest === true);
    } else if (userType === "registered") {
      filteredCustomers = filteredCustomers.filter(cust => cust.is_guest === false);
    }
    
    // Filter by search query
    const q = query.toLowerCase().trim();
    if (q) {
      filteredCustomers = filteredCustomers.filter(
        (cust) =>
          cust.full_name.toLowerCase().includes(q) ||
          cust.email.toLowerCase().includes(q)
      );
    }
    
    return filteredCustomers;
  }, [query, userType, customers]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
  const numberedRows = slice.map((cust, index) => ({
    ...cust,
    rowNumber: (page - 1) * pageSize + (index + 1),
  }));

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [userType, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Customer Management</h1>
        </div>
 <div className="flex-1 flex gap-2">
        <div className="mb-6">
          <FilterTab
            options={userTypeOptions}
            value={userType}
            onChange={setUserType}
          />
        </div>

        <div className="flex-1 hidden md:flex items-center justify-end gap-3 ">
                     <SearchInput
                       value={query}
                       onChange={setQuery}
                       placeholder="Search..."
                     />
                   </div>
</div>
        <div className="mb-4 text-sm text-gray-600">
          Showing {filtered.length} {userType !== "all" ? userType : ""} customer{filtered.length !== 1 ? 's' : ''}
        </div>

        <Table columns={defaultCustomerColumns} rows={numberedRows} />

        <Pagination page={page} total={totalPages} onChange={setPage} />

        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </div>
    </div>
  );
}