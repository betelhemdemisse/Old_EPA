// UserList.jsx
import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import DynamicForm from "../../components/Form/DynamicForm.jsx";
import HierarchyFilterSelect from "../../components/Form/HierarchyFilterSelect.jsx";
import addUserFields from "./addUserFields.js";
import addUserSchema from "./addUserSchema.js";
import { Import, Plus, Power, PowerOff } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../components/Alerts/Confirmation.jsx";
import UserService from "../../services/user.service.js";
import RoleService from "../../services/role.service.js";
import PollutionCategoryService from "../../services/PollutionCategory.service.js";
import { filterNonRegionalTreeAllowRoot } from "../../utils/hierarchyUtils.js";


export default function UserList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [hierarchyFilter, setHierarchyFilter] = useState(null);
  const [userTab, setUserTab] = useState("all");
  const [loggedInUserHierarchy, setLoggedInUserHierarchy] = useState();
  const [loading, setLoading] = useState(false);
  const [rawOrgData, setRawOrgData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [pollutionCategories, setPollutionCategories] = useState([]);
  const [subPollutionOptions, setSubPollutionOptions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    console.log('isSubmitting state changed to:', isSubmitting);
  }, [isSubmitting]);

  useEffect(() => {
    (async () => {
      try {
        const res = await UserService.getOrganizationHierarchy();
        const rawData = res?.status && Array.isArray(res.data) ? res.data : res;
        if (!Array.isArray(rawData)) return;

        const filteredTree = filterNonRegionalTreeAllowRoot(rawData);

        // 🔐 Restrict by logged-in user hierarchy
        if (loggedInUserHierarchy) {
          const scopedTree = getSubTreeById(
            filteredTree,
            loggedInUserHierarchy
          );
          setOrgData(scopedTree ? [scopedTree] : []);
        } else {
          setOrgData(filteredTree);
        }

        setRawOrgData(rawData);
      } catch (err) {
        console.error("Error loading org structure:", err);
      }
    })();
  }, [loggedInUserHierarchy]);

  useEffect(() => {
    setPage(1);
  }, [hierarchyFilter]);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLoggedInUserHierarchy(decoded.organization_hierarchy_id);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const resUsers = await UserService.getAllUsers();

      const normalized = resUsers.map((item, i) => {
        const hierarchyPath = [];

        let h = item.hierarchies[0]?.hierarchy;
        while (h) {
          hierarchyPath.unshift(h.organization_hierarchy_id);
          h = h.parent;
        }

        return {
          refNo: i + 1,
          user_id: item.user_id,
          fullName: item.name,
          email: item.email,
          gender: item.gender,
          region: item.region,
          hierarchy_ids: hierarchyPath,
          organization_hierarchy_id: hierarchyPath[0],
          hierarchy_name: item.hierarchies[0]?.hierarchy?.hierarchy_name,
          role_id: item.roles.map((r) => r.role_id),
          role: item.roles.map((r) => r.name),
          user_status: item.status ? "Active" : "Inactive",
          status: item.status,
        };
      });

      setUsers(normalized);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      let res;
      if (user.status) {
        res = await UserService.deactiveUser(user.user_id);
      } else {
        res = await UserService.activeUser(user.user_id);
      }

      if (res) {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === user.user_id ? { ...u, status: !u.status } : u
          )
        );
        await fetchUsers();
        setToast({
          open: true,
          message: `User ${user.status ? "deactivated" : "activated"
            } successfully`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      setToast({
        open: true,
        message: "Failed to update user status",
        type: "error",
      });
    }
  };

  const defaultUserColumns = [
    { Header: "Ref No", accessor: "refNo" },
    { Header: "Full Name", accessor: "fullName" },
    { Header: "Email", accessor: "email" },
    { Header: "Role", accessor: "role" },
    {
      Header: "User Status",
      accessor: "user_status",
      Cell: (cellValue, row) => {
        const isActive =
          typeof cellValue === "string" &&
          cellValue.trim().toLowerCase() === "active";

        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={() => handleToggleStatus(row)}
            />
            <div
              className="w-11 h-6 bg-gray-200 rounded-full
                      peer-checked:bg-green-500 transition-colors"
            ></div>
            <div
              className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full
                      peer-checked:translate-x-full transition-transform shadow"
            ></div>
          </label>
        );
      },
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const pc =
          await PollutionCategoryService.PollutionCategoryService.getAllPollutionCategories();
        setPollutionCategories(pc || []);
      } catch (err) {
        console.error("Error loading pollution categories:", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await RoleService.getAllRoles();
        setRoles(r || []);
      } catch (err) {
        console.error("Error loading roles:", err);
      }
    })();
  }, []);

  const clearDescendants = (updated, keepKey) => {
    Object.keys(updated).forEach((k) => {
      if (k.startsWith("childOf_") && k !== keepKey) {
        const parentId = k.replace("childOf_", "");
        if (parentId === keepKey || isDescendantOf(parentId, keepKey)) {
          updated[k] = "";
        }
      }
    });
  };

  const isDescendantOf = (nodeId, parentId) => {
    if (!nodeId) return false;
    let current = orgData.find((h) => h.organization_hierarchy_id === nodeId);
    while (current?.parent_id) {
      if (current.parent_id === parentId) return true;
      current = orgData.find(
        (h) => h.organization_hierarchy_id === current.parent_id
      );
    }
    return false;
  };

  const handleFormChange = (name, value) => {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "organizationHierarchy" || name.startsWith("childOf_")) {
        clearDescendants(updated, name);
      }

      return updated;
    });
  };

  const handlePollutionChange = (pollutionId) => {
    setForm((f) => ({
      ...f,
      pollution_category: pollutionId,
      sub_pollution_category: "",
    }));
    const category = pollutionCategories.find(
      (c) => c.pollution_category_id === pollutionId
    );
    if (category && category.subcategories) {
      setSubPollutionOptions(
        category.subcategories.map((s) => ({
          value: s.sub_pollution_category_id,
          label: s.sub_pollution_category,
        }))
      );
    } else {
      setSubPollutionOptions([]);
    }
  };

  const filteredFields = useMemo(() => {
    if (!addUserFields) return [];

    const baseFields = addUserFields({ fromRegional: false })
      .filter((f) => f.name !== "isRegional" && f.name !== "isCentral")
      .map((f) => {
        switch (f.name) {
          case "role":
            return {
              ...f,
              options: roles.map((r) => ({ value: r.role_id, label: r.name })),
            };
          case "pollution_category":
            return {
              ...f,
              options: pollutionCategories.map((c) => ({
                value: c.pollution_category_id,
                label: c.pollution_category,
              })),
              onChange: handlePollutionChange,
            };
          case "sub_pollution_category":
            return { ...f, options: subPollutionOptions };
          case "organizationHierarchy":
            return {
              ...f,
              options: orgData.map((root) => ({
                disabled: true,
                value: root.organization_hierarchy_id,
                label: root.hierarchy_name,
              })),
            };
          default:
            return f;
        }
      });

    const hierarchyFields = [];
    let parentId = form.organizationHierarchy || null;

    while (parentId) {
      const findNodeRecursive = (nodes, id) => {
        for (const node of nodes) {
          if (node.organization_hierarchy_id === id) return node;
          if (node.children?.length) {
            const found = findNodeRecursive(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const parentNode = findNodeRecursive(orgData, parentId);
      if (!parentNode) break;
      if (!parentNode.children?.length) break;

      const fieldName = `childOf_${parentNode.organization_hierarchy_id}`;
      hierarchyFields.push({
        name: fieldName,
        label: `Select under "${parentNode.hierarchy_name}"`,
        type: "select",
        placeholder: "Select...",
        options: parentNode.children.map((c) => ({
          value: c.organization_hierarchy_id,
          label: c.hierarchy_name,
        })),
      });

      parentId = form[fieldName] || null;
    }

    return [...baseFields, ...hierarchyFields];
  }, [roles, pollutionCategories, subPollutionOptions, orgData, form]);

  const hierarchyFilterFields = useMemo(() => {
    const fields = [];

    fields.push({
      name: "hierarchyRoot",
      label: "Filter by Hierarchy",
      type: "select",
      placeholder: "All hierarchies",
      options: orgData.map((h) => ({
        value: h.organization_hierarchy_id,
        label: h.hierarchy_name,
      })),
    });

    let parentId = hierarchyFilter?.hierarchyRoot || null;

    while (parentId) {
      const findNodeRecursive = (nodes, id) => {
        for (const node of nodes) {
          if (node.organization_hierarchy_id === id) return node;
          if (node.children?.length) {
            const found = findNodeRecursive(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const parentNode = findNodeRecursive(orgData, parentId);
      if (!parentNode || !parentNode.children?.length) break;

      const fieldName = `childOf_${parentNode.organization_hierarchy_id}`;

      fields.push({
        name: fieldName,
        label: `Under "${parentNode.hierarchy_name}"`,
        type: "select",
        placeholder: "All",
        options: parentNode.children.map((c) => ({
          value: c.organization_hierarchy_id,
          label: c.hierarchy_name,
        })),
      });

      parentId = hierarchyFilter?.[fieldName] || null;
    }

    return fields;
  }, [orgData, hierarchyFilter]);

  const getLastSelectedHierarchy = (filter) => {
    if (!filter) return null;

    const values = Object.values(filter).filter(Boolean);
    return values.length ? values[values.length - 1] : null;
  };

  const filtered = useMemo(() => {
    let result = users;

    if (userTab === "withHierarchy") {
      result = result.filter(
        (u) => Array.isArray(u.hierarchy_ids) && u.hierarchy_ids.length > 0
      );
    } else if (userTab === "withoutHierarchy") {
      result = result.filter(
        (u) => !Array.isArray(u.hierarchy_ids) || u.hierarchy_ids.length === 0
      );
    }

    const q = query.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (u) =>
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.region || "").toLowerCase().includes(q)
      );
    }

    const selectedHierarchyId = getLastSelectedHierarchy(hierarchyFilter);
    if (selectedHierarchyId && userTab !== "withoutHierarchy") {
      result = result.filter(
        (u) =>
          Array.isArray(u.hierarchy_ids) &&
          u.hierarchy_ids.length > 0 &&
          u.hierarchy_ids.includes(selectedHierarchyId)
      );
    }

    return result;
  }, [users, query, hierarchyFilter, userTab]);

  const handleHierarchyFilterChange = (name, value) => {
    setHierarchyFilter((prev) => {
      const updated = { ...prev, [name]: value };

      const keys = Object.keys(updated).filter(
        (k) => k === "hierarchyRoot" || k.startsWith("childOf_")
      );

      const currentIndex = keys.indexOf(name);

      keys.forEach((k, index) => {
        if (index > currentIndex) {
          updated[k] = "";
        }
      });

      return updated;
    });
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const actions = {
    onView: (row) => {
      setViewUser(row);
      setViewOpen(true);
    },

onEdit: (row) => {
  if (!roles.length) return;

  const initialForm = {
    fullName: row.fullName || "",
    email: row.email || "",
    gender: row.gender || "",
    role: row.role_id || [],
    organizationHierarchy: row.hierarchy_ids?.[0] || "",
  };

  row.hierarchy_ids?.forEach((id, idx) => {
    if (idx === 0) return;
    const parentId = row.hierarchy_ids[idx - 1];
    initialForm[`childOf_${parentId}`] = id;
  });

  if (row.sub_pollution_category_id?.length) {
    initialForm.sub_pollution_category = row.sub_pollution_category_id[0];

    const parentCategory = pollutionCategories.find((c) =>
      c.subcategories?.some(
        (s) => s.sub_pollution_category_id === row.sub_pollution_category_id[0]
      )
    );
    if (parentCategory)
      initialForm.pollution_category = parentCategory.pollution_category_id;
  }

  const includePath = (nodes, pathIds) => {
    return nodes
      .map((node) => {
        if (!pathIds.includes(node.organization_hierarchy_id)) return null;
        const newNode = { ...node };
        if (node.children) {
          newNode.children = includePath(node.children, pathIds).filter(Boolean);
        }
        return newNode;
      })
      .filter(Boolean);
  };

  const fullTreeForUser = includePath(rawOrgData, row.hierarchy_ids);

  setOrgData(fullTreeForUser);

  setForm(initialForm);
  setIsEditing(true);
  setSelectedUser(row);
  setModalOpen(true);
},

    onDelete: (row) => {
      setToDeleteId(row.user_id);
      setConfirmOpen(true);
    },
  };


  const handleConfirmDelete = async () => {
    if (!toDeleteId) return setConfirmOpen(false);

    try {
      const deleted = await UserService.deleteUsers(toDeleteId);
      if (deleted) {
        setUsers((u) => u.filter((x) => x.user_id !== toDeleteId));
        setToast({
          open: true,
          message: "User deleted successfully",
          type: "success",
        });
      } else {
        setToast({
          open: true,
          message: "Failed to delete user",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setToast({ open: true, message: "Server error", type: "error" });
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  useEffect(() => {
    if (form.pollution_category) {
      const category = pollutionCategories.find(
        (c) => c.pollution_category_id === form.pollution_category
      );
      setSubPollutionOptions(
        category?.subcategories?.map((s) => ({
          value: s.sub_pollution_category_id,
          label: s.sub_pollution_category,
        })) || []
      );
    }
  }, [form.pollution_category, pollutionCategories]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    console.log('handleFormSubmit called, isSubmitting:', isSubmitting);

    if (isSubmitting) {
      console.log('Already submitting, returning early');
      return;
    }

    setSubmitAttempted(true);

    const validation = addUserSchema.safeParse(form);
    if (!validation.success) {
      console.log('Form validation failed:', validation.error);
      setIsSubmitting(false);
      return;
    }

    const hierarchyKeys = [
      "organizationHierarchy",
      ...Object.keys(form).filter((k) => k.startsWith("childOf_")),
    ];

    let lastHierarchyId = null;
    for (const key of hierarchyKeys) {
      if (form[key]) lastHierarchyId = form[key];
    }

    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      gender: form.gender || null,
      role_ids: Array.isArray(form.role) ? form.role.flat() : [form.role],
      hierarchy_ids: lastHierarchyId ? [lastHierarchyId] : undefined,
      sub_pollution_category_id: form.sub_pollution_category
        ? [form.sub_pollution_category]
        : undefined,
      isRegional: false,
    };
    setIsSubmitting(true);

    try {
      const response =
        isEditing && selectedUser?.user_id
          ? await UserService.updateUsers(selectedUser.user_id, payload)
          : await UserService.createUsers(payload);

      if (!response) {
        setToast({ open: true, message: "Failed to save user", type: "error" });
        setIsSubmitting(false);
        return;
      }

      setToast({
        open: true,
        message: isEditing
          ? "User updated successfully"
          : "User created successfully",
        type: "success",
      });

      await fetchUsers();

      setModalOpen(false);
      setForm({});
      setSubmitAttempted(false);
      setIsEditing(false);
      setSelectedUser(null);

    } catch (err) {
      console.error("Error submitting user:", err);
      setToast({
        open: true,
        message: err.message || "Server error",
        type: "error"
      });
    } finally {
      // Always reset submitting state
      console.log('Setting isSubmitting to false in finally block');
      setIsSubmitting(false);
    }
  };

  const handleAddUser = () => {
    setSubmitAttempted(false);
    setIsEditing(false);
    setSelectedUser(null);

    if (loggedInUserHierarchy) {
      setForm({
        organizationHierarchy: loggedInUserHierarchy,
      });
    }

    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({});
    setIsEditing(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl  mt-[30px] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-2">
            <h1 className="text-xl font-semibold text-gray-900">
              User Management
            </h1>
            <p className="text-sm w-60 text-[#A3AED0]">
              This is the user management of the Super professional.
            </p>
          </div>

          <div className="flex-1 flex gap-2">
            <HierarchyFilterSelect
              fields={hierarchyFilterFields}
              value={hierarchyFilter}
              onChange={handleHierarchyFilterChange}
              disabled={userTab === "withoutHierarchy"}
              onClear={() => setHierarchyFilter(null)}
            />
            <div className="flex-1 hidden md:flex items-center justify-end gap-3 ">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button color="green" onClick={handleAddUser}>
              <Plus />
              <span className="hidden md:flex"> Add User</span>
            </Button>
          </div>
        </div>

        <Table columns={defaultUserColumns} rows={slice} actions={actions} />

        <Modal
          open={modalOpen}
          width="w-full max-w-2xl"
          onClose={handleModalClose}
          title={isEditing ? "Edit User" : "Add User"}
          description={
            isEditing
              ? "Update the user details."
              : "Fill in the details to add a new user."
          }
          actions={[
            <Button
              key="cancel"
              variant="outline"
              color="gray"
              onClick={handleModalClose}
            >
              Cancel
            </Button>,
            <Button
              key="save"
              color="green"
              disabled={isSubmitting}
              onClick={handleFormSubmit}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Saving...
                </>
              ) : (
                isEditing ? "Update" : "Save"
              )}
            </Button>,
          ]}
        >
          <DynamicForm
            fields={filteredFields}
            values={form}
            onChange={handleFormChange}
            schema={addUserSchema}
            submitAttempted={submitAttempted}
            onSubmit={handleFormSubmit}
          />


        </Modal>

        <Modal
          open={viewOpen}
          width="w-full max-w-2xl"
          onClose={() => setViewOpen(false)}
          title="User Details"
          description="View user information"
          actions={[
            <Button key="close" variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>,
          ]}
        >
          {viewUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">

              <div><strong>Full Name:</strong> {viewUser.fullName || viewUser.name}</div>

              <div><strong>Email:</strong> {viewUser.email}</div>
              <div><strong>Gender:</strong> {viewUser.gender || "-"}</div>

              <div><strong>Status:</strong> {viewUser.status ? "Active" : "Inactive"}</div>
              <div><strong>Regional:</strong> {viewUser.isRegional ? "Yes" : "No"}</div>

              <div><strong>Department:</strong> {viewUser.department_id || "-"}</div>

              <div>
                <strong>Roles:</strong>{" "}
                {Array.isArray(viewUser.roles)
                  ? viewUser.roles.map(r => r.name).join(", ")
                  : Array.isArray(viewUser.role)
                    ? viewUser.role.join(", ")
                    : "-"}
              </div>

              <div>
                <strong>Hierarchy:</strong>{" "}
                {viewUser.hierarchies?.[0]?.hierarchy?.hierarchy_name ||
                  viewUser.hierarchy_name ||
                  "-"}
              </div>

            </div>
          )}
        </Modal>



        <div className="mt-3">
          <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
        </div>

        <ToastMessage
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={3500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />

        <Confirmation
          open={confirmOpen}
          title="Delete user"
          message="This action cannot be undone. Are you sure you want to delete this user?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}