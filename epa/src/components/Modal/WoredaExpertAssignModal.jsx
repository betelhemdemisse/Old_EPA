import React, { useState } from "react";
import RegionalWorkFlow from "../../services/regionalWorkflow.service";

export default function AssignModal({
  loggedInUserHierarchy,
  departments,
  loadData,
  complaint_id,
  open,
  onClose,
  experts = [],
  onConfirm,
  mode = "org",
  title = "Assign",
}) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const hasExperts = experts.length > 0;

  const getCaseStatusByHierarchy = (loggedInHierarchyId, expertHierarchy) => {
    if (!loggedInHierarchyId || !expertHierarchy) return null;

    const expertHierarchyId =
      expertHierarchy.organization_hierarchy_id;
    const parentId = expertHierarchy?.hierarchy?.parent_id;

    if (expertHierarchyId === loggedInHierarchyId) {
      return "assigned_to_woreda_expert";
    }
    return null;
  };

  const assignExperts = async () => {
    if (!selectedUser || !hasExperts) return;

    const expertObj = experts.find(
      (u) => u.user_id === selectedUser || u.id === selectedUser
    );

    const expertHierarchy = expertObj?.hierarchies?.[0];
    const case_status = getCaseStatusByHierarchy(
      loggedInUserHierarchy,
      expertHierarchy
    );

    if (!case_status) {
      alert("Invalid hierarchy selection");
      return;
    }

    const payload = {
      complaint_id,
      expert_id: selectedUser,
      assign_to: title,
      organization_hierarchy_id:
        expertHierarchy.organization_hierarchy_id,
      case_status,
    };

    try {
      setLoading(true);
      const res = await RegionalWorkFlow.assignToWoredaExpert(payload);
      loadData?.();
      onConfirm?.(res);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Expert</h3>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Expert
            </label>

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
                <option value="">Select</option>
                {experts.map((u) => (
                  <option
                    key={u.user_id || u.id}
                    value={u.user_id || u.id}
                  >
                    {u.name || u.username || u.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              disabled={!hasExperts || loading || !selectedUser}
              onClick={assignExperts}
              className={`px-4 py-2 rounded text-white
                ${
                  !hasExperts || loading || !selectedUser
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
  );
}
