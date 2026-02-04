import { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import DynamicForm from "../../components/Form/DynamicForm.jsx";
import addRoleAndPermissionFields from "./addRoleAndPermissionFields.js";
import addRolsAndPermissionsSchema from "./addRoleAndPermissionSchema.js";
import { Plus } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../components/Alerts/Confirmation.jsx";
import CheckBoxs from "../../components/Form/CheckBoxs.jsx";
import RoleService from "../../services/role.service";
import permissionService from "../../services/permission.service.js";

export default function UserRoleAndPermissionList() {
  // ---------------- STATE -------------------
  const [rolsAndPermissions, setrolsAndPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [editId, setEditId] = useState(null);
  const isEdit = Boolean(editId);

  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [groupTitles, setGroupTitles] = useState([]);
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };
  console.log(viewData, "viewData")
  const processRoles = (roles) => {
    return roles
      .sort((a, b) => a.role.localeCompare(b.role))
      .map((role, index) => ({ ...role, refNo: index + 1 }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [roles, perms] = await Promise.all([
          RoleService.getAllRoles(),
          permissionService.getAllPermissions(),
        ]);

        if (!roles || !perms) {
          setLoading(false);
          return;
        }

        // Normalize permissions
        const permissionMap = perms.map(p => ({
          id: p.permission_id,
          label: p.action.toLowerCase().replace(/_/g, " "),
          resource: p.resource.toLowerCase().replace(/_/g, " "),
          action: p.action.toLowerCase().replace(/_/g, " "),
        }));

        // Permission groups
        const resources = [...new Set(permissionMap.map(p => p.resource))];
        setGroupTitles(resources);

        // Build roles with permissions (even empty ones)
        const transformed = roles.map((role, index) => {
          const assignedIds = role.permissions?.map(p => p.permission_id) || [];

          const groups = resources.map((resource, gi) => ({
            id: `g${gi + 1}`,
            title: resource,
            items: permissionMap
              .filter(p => p.resource === resource)
              .map(p => ({
                ...p,
                checked: assignedIds.includes(p.id),
              })),
          }));

          return {
            id: role.role_id,
            role: role.name.toLowerCase().replace(/_/g, " "),
            description: role.description || "",
            permission: groups,
            refNo: index + 1,
          };
        });

        setrolsAndPermissions(transformed);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);



  const allPermissions = useMemo(() => {
    const all = [];

    rolsAndPermissions.forEach(role => {
      role.permission?.forEach(group => {
        group.items?.forEach(p => {
          if (!all.find(x => x.id === p.id)) {
            all.push({ id: p.id, label: p.label, resource: p.resource });
          }
        });
      });
    });

    return all;
  }, [rolsAndPermissions]);

  const handleFormChange = (name, value) =>
    setForm(f => ({ ...f, [name]: value }));

  const handleAddRoleAndPermission = () => {
    setSubmitAttempted(false);
    const initialGroups = groupTitles.map((resource, gi) => ({
      id: `g${gi + 1}`,
      title: resource.toLowerCase().trim(),
      items: allPermissions
        .filter(p => p.resource === resource)
        .map(p => ({ ...p, checked: false }))
    }));

    setForm({
      role: "",
      description: "",
      permission: initialGroups
    });

    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({});
    setEditId(null);
  };


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const selectedPermissions = [];
    form.permission.forEach(g =>
      g.items.forEach(i => {
        if (i.checked) selectedPermissions.push(i.id);
      })
    );

    const validation = addRolsAndPermissionsSchema.safeParse({
      role: form.role.toLowerCase().trim(),
      description: form.description.toLowerCase().trim(),
      permission: selectedPermissions,
    });

    if (!validation.success) return;

    const payload = {
      name: validation.data.role.toLowerCase().trim(),
      description: validation.data.description,
      permissions: validation.data.permission,
    };

    try {
      let response;

      // --------- EDIT MODE ----------
      if (editId) {
        response = await RoleService.updateRole(editId, payload);

        if (response?.role) {
          setrolsAndPermissions(prev =>
            processRoles(prev.map(r =>
              r.id === editId
                ? {
                  ...r,
                  role: response?.role?.name.toLowerCase().trim(),
                  description: response?.role?.description,
                  permission: form.permission,
                }
                : r
            ))
          );

          setToast({ open: true, message: "Role updated successfully", type: "success" });
        }
      }

      // --------- ADD MODE ----------
      else {
        response = await RoleService.createRole(payload);

        if (response?.role) {
          setrolsAndPermissions(prev => processRoles([
            {
              id: response.role.role_id,
              role: response.role.name,
              description: response.role.description,
              permission: form.permission,
            },
            ...prev,
          ]));

          setToast({ open: true, message: "Role created successfully", type: "success" });
        }
      }

      setModalOpen(false);
      setForm({});
      setEditId(null);

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Operation failed", type: "error" });
    }
  };


  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rolsAndPermissions;

    return rolsAndPermissions.filter(r => {
      if (r.role?.toLowerCase().includes(q)) return true;

      return r.permission?.some(group =>
        group.items.some(p => p.label.toLowerCase().includes(q))
      );
    });
  }, [query, rolsAndPermissions]);

  // ---------------- PAGINATION -------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  // ---------------- TABLE ACTIONS -------------------
  const actions = {
    onEdit: async (row) => {
      const id = row?.id;
      setEditId(id);
      setSubmitAttempted(false);
      const existing = await RoleService.getRoleById(id);
      if (!existing) return;

      // ✅ Normalize backend response → frontend format
      const normalized = {
        id: existing.role_id,          // <-- IMPORTANT FIX
        name: existing.name.toLowerCase().trim(),
        description: existing.description || "",
        permissions: existing.permissions || []
      };

      // Build grouped permissions for the form
      const grouped = groupTitles.map((resource, gi) => ({
        id: `g${gi + 1}`,
        title: resource.toLowerCase().trim(),
        items: allPermissions
          .filter(p => p.resource === resource)
          .map(p => ({
            ...p,
            checked: normalized.permissions.some(
              ep => ep.permission_id === p.id
            )
          }))
      }));

      setForm({
        role: normalized.name,
        description: normalized.description,
        permission: grouped
      });

      setModalOpen(true);
    },
    onView: async (row) => {
      const id = row?.id;

      const data = await RoleService.getRoleById(id);
      if (!data) return;

      // Directly store the response (exact JSON structure)
      setViewData(data);
      setViewOpen(true);
    },
    onDelete: row => {
      setToDeleteId(row.id);  // row.original is not needed
      setConfirmOpen(true);
    },

  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return;

    try {
      await RoleService.deleteRole(toDeleteId);

      setrolsAndPermissions(prev =>
        processRoles(prev.filter(role => role.id !== toDeleteId))
      );

      setToast({
        open: true,
        message: "Role deleted successfully.",
        type: "success",
      });

    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: "Error deleting role.",
        type: "error",
      });
    }

    setConfirmOpen(false);
    setToDeleteId(null);
  };


  const columns = useMemo(() => [
    { Header: "Ref No", accessor: "refNo" },
    { Header: "Role", accessor: "role" },
    {
      Header: "Permissions",
      accessor: "permission",
      Cell: (_value, row) => {
        const allItems = row.permission.flatMap(g => g.items);
        const total = allItems.length;
        const checked = allItems.filter(p => p.checked).length;

        if (total === 0) {
          return <span>No Access</span>;
        }

        const ratio = checked / total;

        let label = "Custom Access";

        if (checked === 0) {
          label = "No Access";
        } else if (ratio === 1) {
          label = "Full Access";
        } else if (ratio >= 0.5) {
          label = "Half Access";
        } else if (ratio >= 0.25) {
          label = "Quarter Access";
        }

        return (
          <span className="font-medium">
            {checked}
          </span>
        );
      }
    }

  ], []);

  const groupedPermissions = viewData?.permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm.action);
    return acc;
  }, {});

  // ---------------- RENDER -------------------
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex-col  flex-[1] gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">
            Role Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage all Roles
          </p>
        </div>
        <div className="flex justify-end flex-[2] gap-2 items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search report"
          />
          <Button color="green" onClick={handleAddRoleAndPermission}>
            <Plus />
            <span className="hidden w-20 md:flex"> Add Role</span>
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} rows={slice} actions={actions} />

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={isEdit ? "Update Role" : "Add Role"}
        description={isEdit ? "Update the role details." : "Fill in the details to add a role."}
        width="w-full max-w-7xl"
        actions={[
          <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button key="save" color="green" onClick={handleFormSubmit}>
            {isEdit ? "Update" : "Create"}
          </Button>
        ]}
      >


        <DynamicForm
          fields={addRoleAndPermissionFields}
          values={form}
          onChange={handleFormChange}
          schema={addRolsAndPermissionsSchema}
          submitAttempted={submitAttempted}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permissions
          </label>

          {/* MASTER SELECT ALL */}
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-green-600"
              checked={
                form.permission?.every(g =>
                  g.items.every(i => i.checked)
                )
              }
              onChange={() => {
                const allChecked = form.permission.every(g =>
                  g.items.every(i => i.checked)
                );

                const updated = form.permission.map(g => ({
                  ...g,
                  items: g.items.map(i => ({ ...i, checked: !allChecked }))
                }));

                handleFormChange("permission", updated);
              }}
            />

            <span className="font-medium">Select All</span>
          </label>

          <div className="space-y-6">
            {chunkArray(form.permission || [], 3).map((row, index) => (
              <div key={index} className="grid grid-cols-1 capitalize sm:grid-cols-3 gap-4">
                {row.map(group => (
                  <CheckBoxs
                    key={group.id}
                    items={[group]}
                    showGlobalSelectAll={false}
                    onChange={(updatedGroups) => {
                      const updatedGroup = updatedGroups[0];
                      const newList = [...form.permission];
                      const idx = newList.findIndex(x => x.id === updatedGroup.id);
                      newList[idx] = updatedGroup;
                      handleFormChange("permission", newList);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>


      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        width="w-full max-w-6xl"
        title="Role Details"
        description="View the complete details of this role."
        actions={[
          <Button key="close" onClick={() => setViewOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {viewData && (
          <div className="space-y-6 text-sm">

            {/* Role Info */}
            <div className="bg-white border rounded-lg p-4">
              <p className="mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {viewData.name}
              </p>
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {viewData.description || "N/A"}
              </p>
            </div>


            {/* Permissions */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-base">
                Permissions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedPermissions).map(
                  ([resource, actions]) => (
                    <div
                      key={resource}
                      className="border rounded-md p-4 bg-green-50"
                    >
                      <p className="font-semibold mb-2 capitalize text-green-800">
                        {resource}
                      </p>

                      {/* Ordered list */}
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {actions.map((action, index) => (
                          <li key={index} className="text-green-800">
                            {action}
                          </li>
                        ))}
                      </ul>

                    </div>
                  )
                )}
              </div>
            </div>


          </div>
        )}
      </Modal>


      {/* PAGINATION */}
      <Pagination page={pageSafe} total={totalPages} onChange={setPage} />

      {/* TOAST */}
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />

      {/* CONFIRMATION */}
      <Confirmation
        open={confirmOpen}
        title="Delete Role"
        message="This action cannot be undone. Are you sure?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
