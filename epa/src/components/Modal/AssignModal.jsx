import React, { useState } from "react";
import RegionalWorkFlow from "../../services/regionalWorkflow.service";


export default function AssignModal({
  loggedInUserHierarchy,
  loadData,
  complaint_id,
  case_id,
  open,
  onClose,
  experts,
  onConfirm,
  mode = "single",
  title = "Assign"
}) {
  const [loading, setLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]); 

  const [selectedUser, setSelectedUser] = useState("");

  const expertsList = Array.isArray(experts)
    ? experts
    : experts?.data || experts?.experts || [];

  const isTeamMode = mode === "team";

  // ACCURATE level detection: Region, Zone, City, Woreda, Subcity
  const getLevelBracket = (user) => {
    const h = user?.hierarchies?.[0]?.hierarchy;
    if (!h) return "";

    // Region: no parent
    if (!h.parent_id) {
      return " (Region)";
    }

    // Woreda or Subcity: has grandparent
    if (h.parent?.parent_id) {
      return h.subcity_id ? " (Subcity)" : " (Woreda)";
    }

    // Zone or City: has parent (region), no grandparent
    if (h.parent_id) {
      if (h.subcity_id) return " (Subcity)"; // edge case
      if (h.city_id) return " (City)";
      return " (Zone)";
    }

    return "";
  };

  const getHierarchyName = (user) => {
    return user?.hierarchies?.[0]?.hierarchy?.name || "";
  };

  const getCaseStatusByHierarchy = (loggedInHierarchyId, expertHierarchy) => {
    if (!loggedInHierarchyId || !expertHierarchy) return null;

    const expertHierarchyId = expertHierarchy.organization_hierarchy_id;
    const parentId = expertHierarchy?.hierarchy?.parent_id;
    const grandParentId = expertHierarchy?.hierarchy?.parent?.parent_id;

    if (expertHierarchyId === loggedInHierarchyId) {
      return "assigned_to_regional_expert";
    }
    if (parentId === loggedInHierarchyId) {
      return "assigned_to_zone_city_expert";
    }
    if (grandParentId === loggedInHierarchyId) {
      return "assigned_to_woreda_expert";
      
    }
    return null;
  };

  const assignSingleExpert = async () => {
    if (!selectedUser) {
      alert("Please select an expert");
      return;
    }

    const expertObj = expertsList.find(
      (u) => u?.user_id === selectedUser || u?.id === selectedUser
    );

    const expertHierarchy = expertObj?.hierarchies?.[0];
    const case_status = getCaseStatusByHierarchy(loggedInUserHierarchy, expertHierarchy);

    if (!case_status) {
      alert("Invalid hierarchy selection");
      return;
    }

    const payload = {
      complaint_id,
      expert_id: selectedUser,
      assign_to: title,
      organization_hierarchy_id: expertHierarchy.organization_hierarchy_id,
      case_status,
    };

    try {
      setLoading(true);
      const res = await RegionalWorkFlow.assignFromRegion(payload);
      setLoading(false);
      loadData?.();
      onConfirm && onConfirm(res);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to assign expert");
    }
  };

  const createTeam = async () => {
    if (!case_id) {
      alert("Case ID is missing. Cannot form team.");
      return;
    }
    if (selectedUsers.length === 0) {
      alert("Please select at least one expert");
      return;
    }

    const payload = {
      case_id,
      users: selectedUsers,
      handling_unit: "regional_team",
    };

    try {
      setLoading(true);
      const res = await RegionalWorkFlow.createRegionalTeam(payload);
      setLoading(false);
      loadData?.();
      onConfirm && onConfirm(res);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(err.response?.data?.message || "Failed to form team");
    }
  };

  const handleConfirm = () => {
    if (isTeamMode) {
      createTeam();
    } else {
      assignSingleExpert();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {isTeamMode ? "Form Expert Team" : "Assign Expert"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {isTeamMode ? "Select Experts (multiple)" : "Select Expert"}
            </label>

            {isTeamMode ? (
              <div className="border rounded p-2 max-h-60 overflow-y-auto">
                {(expertsList || []).map((u) => {
                  const levelBracket = getLevelBracket(u);
                  const hierarchyName = getHierarchyName(u);

                  return (
                    <label
                      key={u?.user_id || u?.id}
                      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.user_id || u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.user_id || u.id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== (u.user_id || u.id))
                            );
                          }
                        }}
                      />
                      <span className="text-sm">
                        <span className="font-medium">
                          {u.name || u.username || u.email}
                        </span>
                        {" "}
                        <span className="text-gray-500">
                          {levelBracket}
                        </span>
                        {hierarchyName && (
                          <span className="text-gray-600">
                            {" "}— {hierarchyName}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select expert</option>
                {(expertsList || []).map((u) => {
                  const levelBracket = getLevelBracket(u);
                  const hierarchyName = getHierarchyName(u);
                  const name = u.name || u.username || u.email;

                  const displayText = hierarchyName
                    ? `${name}${levelBracket} — ${hierarchyName}`
                    : `${name}${levelBracket}`;

                  return (
                    <option key={u?.user_id || u?.id} value={u?.user_id || u?.id}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {isTeamMode && selectedUsers.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {selectedUsers.length} expert{selectedUsers.length > 1 ? "s" : ""}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={loading || (isTeamMode ? selectedUsers.length === 0 : !selectedUser)}
              onClick={handleConfirm}
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isTeamMode ? "Form Team" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}