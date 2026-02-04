import React, { useState, useMemo } from "react";
import caseService from "../../services/case.service";
import ToastMessage from "../Alerts/ToastMessage";

// Modal for assigning an expert to a case
export default function AssignModal({
  open,
  onClose,
  experts = [],
  complaint_id,
  title = "Assign Expert",
  loadData,
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const hasExperts = experts.length > 0;

  const filteredExperts = useMemo(() => {
    if (!hasExperts) return [];
    return experts.filter((u) =>
      `${u.name || ""} ${u.email || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [experts, search, hasExperts]);

  const assignExperts = async () => {
    if (!selectedUser || !hasExperts) return;

    try {
      setLoading(true);

      await caseService.forceExpertAssign({
        complaint_id,
        expert_id: selectedUser,
      });

      setToast({
        open: true,
        message: "Expert assigned successfully",
        type: "success",
      });

      loadData?.();
      onClose();
    } catch (err) {
      setToast({
        open: true,
        message: "Failed to assign expert",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="text-gray-500">
              Close
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search expert..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!hasExperts}
            />

            {/* Expert Selection */}
            {!hasExperts ? (
              <div className="p-3 border rounded bg-gray-50 text-sm text-red-600">
                No experts are available for assignment.
              </div>
            ) : (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select expert</option>
                {filteredExperts.length > 0 ? (
                  filteredExperts.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No matching experts found</option>
                )}
              </select>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                disabled={!hasExperts || !selectedUser || loading}
                onClick={assignExperts}
                className={`px-4 py-2 rounded text-white
                  ${
                    !hasExperts || !selectedUser || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600"
                  }`}
              >
                {loading ? "Assigning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.open && (
        <ToastMessage
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
        />
      )}
    </>
  );
}
