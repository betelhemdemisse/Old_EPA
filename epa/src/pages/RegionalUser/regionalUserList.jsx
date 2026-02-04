import { useEffect, useMemo, useState } from "react";
import { Import, Plus } from "lucide-react";

import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import Button from "../../components/Buttons/Buttons.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import DynamicForm from "../../components/Form/DynamicForm.jsx";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import Confirmation from "../../components/Alerts/Confirmation.jsx";
import HierarchyFilterSelect from "../../components/Form/HierarchyFilterSelect.jsx"; 

import addUserFields from "./addUserFields.js";
import addUserSchema from "./addUserSchema.js";

import AdminstratorService from "../../services/administrator.service.js";
import RoleService from "../../services/role.service.js";
import PollutionCategoryService from "../../services/PollutionCategory.service.js";
import UserService from "../../services/user.service.js";
import { filterRegionalTreeAllowRoot, getChildrenByDepth, findNodeByIdAllRoots } from "../../utils/hierarchyUtils.js";
import { jwtDecode } from "jwt-decode";

function generateChildHierarchyFields(hierarchyIds = []) {
  const result = {};
  for (let i = 1; i < hierarchyIds.length; i++) {
    result[`childOf_${hierarchyIds[i - 1]}`] = hierarchyIds[i];
  }
  return result;
}

// Function to check if a hierarchy ID is part of the logged-in user's accessible tree
const isAccessibleHierarchy = (hierarchyId, loggedInUserHierarchyId, loggedInUserHierarchyPath, orgData) => {
  // If logged in user is at the common root, they can assign to immediate children only
  if (loggedInUserHierarchyId === "496f1948-559a-428b-86cd-47f546a90933") {
    // Common root can assign to its immediate children
    const rootNode = findNodeByIdAllRoots(orgData, loggedInUserHierarchyId);
    const immediateChildrenIds = rootNode?.children?.map(child => child.organization_hierarchy_id) || [];
    return immediateChildrenIds.includes(hierarchyId);
  }
  
  // For non-root users
  const userNode = findNodeByIdAllRoots(orgData, loggedInUserHierarchyId);
  if (!userNode) return false;
  
  // Check if the hierarchyId is the same as logged-in user's hierarchy
  if (hierarchyId === loggedInUserHierarchyId) return true;
  
  // Check if the hierarchyId is an immediate child of logged-in user's hierarchy
  const immediateChildrenIds = userNode.children?.map(child => child.organization_hierarchy_id) || [];
  if (immediateChildrenIds.includes(hierarchyId)) return true;
  
  return false;
};

// Function to flatten all hierarchies for easier searching
const flattenHierarchies = (nodes) => {
  const flat = [];
  const flatten = (node) => {
    if (!node) return;
    flat.push(node);
    if (node.children) {
      node.children.forEach(child => flatten(child));
    }
  };
  nodes?.forEach(node => flatten(node));
  return flat;
};

// Find node by ID in flattened data
const findNodeById = (flatData, id) => {
  return flatData.find(node => node.organization_hierarchy_id === id);
};

export default function RegionalUserList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [hierarchyFilter, setHierarchyFilter] = useState(null);
  const [userTab, setUserTab] = useState("all"); 
  const [loggedInUserHierarchy, setLoggedInUserHierarchy] = useState();
  const [loggedInUserHierarchyPath, setLoggedInUserHierarchyPath] = useState([]);
  const [flatOrgData, setFlatOrgData] = useState([]);

  // remote/state data
  const [rawOrgData, setRawOrgData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [pollutionCategories, setPollutionCategories] = useState([]);
  const [subPollutionOptions, setSubPollutionOptions] = useState([]);
  const [roles, setRoles] = useState([]);

  const token = localStorage.getItem("token");
  
  // Function to get the full hierarchy path for a node
  const getHierarchyPath = (nodeId, allNodes) => {
    const path = [];
    let currentNode = findNodeById(allNodes, nodeId);
    
    while (currentNode) {
      path.unshift(currentNode.organization_hierarchy_id);
      currentNode = findNodeById(allNodes, currentNode.parent_id);
    }
    
    return path;
  };

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

  // Update the fetchUsers to also fetch the logged-in user's hierarchy path
  useEffect(() => {
    const fetchLoggedInUserHierarchyPath = async () => {
      try {
        const res = await UserService.getOrganizationHierarchy();
        const allNodes = res?.status && Array.isArray(res.data) ? res.data : res;
        
        if (!Array.isArray(allNodes)) return;
        
        // Flatten the data for easier searching
        const flattened = flattenHierarchies(allNodes);
        setFlatOrgData(flattened);
        
        if (loggedInUserHierarchy) {
          const path = getHierarchyPath(loggedInUserHierarchy, flattened);
          setLoggedInUserHierarchyPath(path);
        }
      } catch (err) {
        console.error("Error fetching hierarchy path:", err);
      }
    };

    if (loggedInUserHierarchy) {
      fetchLoggedInUserHierarchyPath();
    }
  }, [loggedInUserHierarchy]);

  const fetchUsers = async () => {
    try {
      const resUsers = await AdminstratorService.getAllRegionUser();
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
          role_id: item.roles.map(r => r.role_id),
          role: item.roles.map(r => r.name),
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

  const getLastSelectedHierarchy = (filter) => {
    if (!filter) return null;
    const values = Object.values(filter).filter(Boolean);
    return values.length ? values[values.length - 1] : null;
  };

  const handleHierarchyFilterChange = (name, value) => {
    setHierarchyFilter(prev => {
      const updated = { ...prev, [name]: value };

      const keys = Object.keys(updated).filter(k =>
        k === 'hierarchyRoot' || k.startsWith('childOf_')
      );

      const currentIndex = keys.indexOf(name);

      keys.forEach((k, index) => {
        if (index > currentIndex) {
          updated[k] = '';
        }
      });

      return updated;
    });
  };

  const handleToggleStatus = async (user) => {
    try {
      user.status
        ? await UserService.deactiveUser(user.user_id)
        : await UserService.activeUser(user.user_id);

      await fetchUsers();

      setToast({
        open: true,
        message: `User ${user.status ? "deactivated" : "activated"} successfully`,
        type: "success",
      });
    } catch {
      setToast({ open: true, message: "Failed to update user status", type: "error" });
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
          cellValue.trim().toLowerCase() === "active"

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

  const hierarchyFilterFields = useMemo(() => {
    if (!orgData) return [];

    const fields = [];

    fields.push({
      name: 'hierarchyRoot',
      label: 'Filter by Hierarchy',
      type: 'select',
      placeholder: 'All hierarchies',
      options: orgData.map(h => ({
        value: h.organization_hierarchy_id,
        label: h.hierarchy_name,
      })),
    });

    let parentId = hierarchyFilter?.hierarchyRoot || null;

    while (parentId) {
      const parentNode = findNodeByIdAllRoots(orgData, parentId);
      if (!parentNode || !parentNode.children?.length) break;

      const fieldName = `childOf_${parentNode.organization_hierarchy_id}`;
      fields.push({
        name: fieldName,
        label: `Under "${parentNode.hierarchy_name}"`,
        type: 'select',
        placeholder: 'All',
        options: parentNode.children.map(c => ({
          value: c.organization_hierarchy_id,
          label: c.hierarchy_name,
        })),
      });

      parentId = hierarchyFilter?.[fieldName] || null;
    }

    return fields;
  }, [orgData, hierarchyFilter]);

  // Updated hierarchyFields function - Only parent (logged-in user's hierarchy) in first select
  const hierarchyFields = useMemo(() => {
    if (!orgData.length || !loggedInUserHierarchy || !flatOrgData.length) {
      return [];
    }

    const fields = [];
    
    // Get the logged-in user's node
    const userNode = findNodeById(flatOrgData, loggedInUserHierarchy);
    if (!userNode) return fields;
    
    // FIRST SELECT FIELD: ONLY the logged-in user's hierarchy (parent)
    fields.push({
      name: 'organizationHierarchy',
      label: 'Assign to Your Hierarchy',
      type: 'select',
      placeholder: 'Select hierarchy level...',
      grid: "col-span-3 mr-6",
      options: [
        {
          value: loggedInUserHierarchy,
          label: `${userNode.hierarchy_name}`,
        }
      ],
      disabled: true, // Make it read-only since there's only one option
      defaultValue: loggedInUserHierarchy,
      description: "Users will be registered at your hierarchy level"
    });

    // SECOND SELECT FIELD: Optional immediate children
    // Only show if the logged-in user has children
    if (userNode.children && userNode.children.length > 0) {
      fields.push({
        name: 'childHierarchy',
        label: 'Assign to Child Hierarchy (Optional)',
        type: 'select',
        placeholder: 'Select a child hierarchy if needed...',
        grid: "col-span-3 mr-6",
        options: [
          {
            value: ''
          },
          ...userNode.children.map(child => ({
            value: child.organization_hierarchy_id,
            label: `${child.hierarchy_name}`,
          }))
        ],
        description: "Optional: If you want to assign this user to a specific child hierarchy"
      });
    }

    // Special case: If user is at the common root, they can assign to regional EPAs
    if (loggedInUserHierarchy === "496f1948-559a-428b-86cd-47f546a90933") {
      const rootNode = findNodeById(flatOrgData, loggedInUserHierarchy);
      if (rootNode?.children) {
        // Add a third field for regional EPAs
        fields.push({
          name: 'regionalEPA',
          label: 'Or Assign to Regional EPA',
          type: 'select',
          placeholder: 'Select a regional EPA...',
          grid: "col-span-3 mr-6",
          options: [
            {
              value: '',
              label: '-- Do not assign to regional EPA --',
            },
            ...rootNode.children
              .filter(child => child.isRegional) // Only show regional EPAs
              .map(child => ({
                value: child.organization_hierarchy_id,
                label: `${child.hierarchy_name} (${child.region?.region_name || 'Regional'})`,
              }))
          ],
          description: "Optional: Assign to a specific regional EPA"
        });
      }
    }

    return fields;
  }, [form, orgData, loggedInUserHierarchy, loggedInUserHierarchyPath, flatOrgData, isEditing]);

  useEffect(() => {
    (async () => {
      try {
        const res = await UserService.getOrganizationHierarchy();
        const rawData = res?.status && Array.isArray(res.data) ? res.data : res;
        setRawOrgData(rawData);
        if (!Array.isArray(rawData)) return;

        const filteredTree = filterRegionalTreeAllowRoot(rawData);
        setOrgData(filteredTree);

        // Flatten the data for easier searching
        const flattened = flattenHierarchies(rawData);
        setFlatOrgData(flattened);

      } catch (err) {
        console.error("Error loading org structure:", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const pc = await PollutionCategoryService.PollutionCategoryService.getAllPollutionCategories();
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

  const handleFormChange = (name, value) => {
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // If user selects a child hierarchy, clear the regional EPA field
      if (name === 'childHierarchy' && value) {
        updated.regionalEPA = '';
      }
      
      // If user selects a regional EPA, clear the child hierarchy field
      if (name === 'regionalEPA' && value) {
        updated.childHierarchy = '';
      }

      if (name === 'isRegional') {
        updated.isCentral = !!value;
        updated.organizationHierarchy = '';
        Object.keys(updated).forEach(k => { 
          if (k.startsWith('childOf_') || k === 'childHierarchy' || k === 'regionalEPA') {
            updated[k] = '';
          }
        });
      }

      return updated;
    });
  };

  const handlePollutionChange = (pollutionId) => {
    setForm(f => ({ ...f, pollution_category: pollutionId, sub_pollution_category: '' }));
    const category = pollutionCategories.find(c => c.pollution_category_id === pollutionId);
    if (category && category.subcategories) {
      setSubPollutionOptions(category.subcategories.map(s => ({ value: s.sub_pollution_category_id, label: s.sub_pollution_category })));
    } else {
      setSubPollutionOptions([]);
    }
  };

  const filteredFields = useMemo(() => {
    const base = addUserFields({ fromRegional: form.isRegional })
      .filter(f => f.name !== "isCentral")
      .map(f => {
        if (f.name === "organizationHierarchy") {
          // This is now handled in hierarchyFields
          return null;
        }

        if (f.name === "pollution_category") {
          return {
            ...f,
            options: pollutionCategories.map(c => ({
              value: c.pollution_category_id,
              label: c.pollution_category,
            })),
            onChange: handlePollutionChange,
          };
        }

        if (f.name === "sub_pollution_category") {
          return { ...f, options: subPollutionOptions };
        }

        if (f.name === "role") {
          return {
            ...f,
            options: roles.map(r => ({
              value: r.role_id,
              label: r.name,
            })),
          };
        }

        return f;
      })
      .filter(Boolean); // Remove null fields

    // Combine base fields with hierarchy fields
    return [...base, ...hierarchyFields];
  }, [form, orgData, pollutionCategories, subPollutionOptions, roles, hierarchyFields]);

  const filtered = useMemo(() => {
    let result = users;

    // 🔹 TAB FILTER
    if (userTab === "withHierarchy") {
      result = result.filter(
        u => Array.isArray(u.hierarchy_ids) && u.hierarchy_ids.length > 0
      );
    }

    if (userTab === "withoutHierarchy") {
      result = result.filter(
        u => !Array.isArray(u.hierarchy_ids) || u.hierarchy_ids.length === 0
      );
    }

    const q = query.toLowerCase().trim();
    if (q) {
      result = result.filter(
        u =>
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.region || "").toLowerCase().includes(q)
      );
    }

    const selectedHierarchyId = getLastSelectedHierarchy(hierarchyFilter);
    if (selectedHierarchyId && userTab !== "withoutHierarchy") {
      result = result.filter(
        u => Array.isArray(u.hierarchy_ids) && u.hierarchy_ids.includes(selectedHierarchyId)
      );
    }

    return result;
  }, [users, query, hierarchyFilter, userTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const actions = {
    onEdit: (row) => {
      if (!roles.length) return;

      const hierarchyPath = row.hierarchy_ids || [];
      const rootId = hierarchyPath[0] || "";

      // Check if the user being edited is accessible to the logged-in user
      const userNode = findNodeById(flatOrgData, loggedInUserHierarchy);
      const targetNode = findNodeById(flatOrgData, rootId);
      
      let isEditable = false;
      
      if (userNode && targetNode) {
        // Check if target is the same hierarchy or immediate child
        if (rootId === loggedInUserHierarchy) {
          isEditable = true;
        } else if (targetNode.parent_id === loggedInUserHierarchy) {
          isEditable = true;
        }
      }

      if (!isEditable) {
        setToast({
          open: true,
          message: "You don't have permission to edit users in this hierarchy",
          type: "error"
        });
        return;
      }

      // Determine which field the user is assigned to
      let childHierarchy = '';
      if (hierarchyPath.length > 1) {
        childHierarchy = hierarchyPath[1]; // First child
      }

      setForm({
        fullName: row.fullName || "",
        email: row.email || "",
        gender: row.gender || "",
        role: row.role_id?.[0] || "",
        organizationHierarchy: loggedInUserHierarchy,
        childHierarchy: childHierarchy || '',
        isRegional: true,
      });

      setIsEditing(true);
      setSelectedUser(row);
      setModalOpen(true);
    },
    onDelete: (row) => {
      // Check if the user being deleted is accessible to the logged-in user
      const hierarchyPath = row.hierarchy_ids || [];
      const rootId = hierarchyPath[0] || "";
      
      const userNode = findNodeById(flatOrgData, loggedInUserHierarchy);
      const targetNode = findNodeById(flatOrgData, rootId);
      
      let isDeletable = false;
      
      if (userNode && targetNode) {
        // Check if target is the same hierarchy or immediate child
        if (rootId === loggedInUserHierarchy) {
          isDeletable = true;
        } else if (targetNode.parent_id === loggedInUserHierarchy) {
          isDeletable = true;
        }
      }

      if (!isDeletable) {
        setToast({
          open: true,
          message: "You don't have permission to delete users in this hierarchy",
          type: "error"
        });
        return;
      }

      setToDeleteId(row.user_id);
      setConfirmOpen(true);
    },
  };

  const handleConfirmDelete = async () => {
    if (!toDeleteId) return setConfirmOpen(false);

    try {
      const deleted = await UserService.deleteUsers(toDeleteId);
      if (deleted) {
        setUsers(u => u.filter(x => x.user_id !== toDeleteId));
        setToast({ open: true, message: 'User deleted successfully', type: 'success' });
      } else {
        setToast({ open: true, message: 'Failed to delete user', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setToast({ open: true, message: 'Server error', type: 'error' });
    } finally {
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  useEffect(() => {
    if (form.pollution_category) {
      const category = pollutionCategories.find(c => c.pollution_category_id === form.pollution_category);
      setSubPollutionOptions(category?.subcategories?.map(s => ({
        value: s.sub_pollution_category_id,
        label: s.sub_pollution_category
      })) || []);
    }
  }, [form.pollution_category, pollutionCategories]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    const result = addUserSchema.safeParse(form);
    if (!result.success) return;

    // Determine which hierarchy to assign to
    let hierarchyId = loggedInUserHierarchy; // Default to logged-in user's hierarchy
    
    // Check if user selected a child hierarchy
    if (form.childHierarchy) {
      hierarchyId = form.childHierarchy;
    }
    
    // Check if user selected a regional EPA (for root users only)
    if (form.regionalEPA) {
      hierarchyId = form.regionalEPA;
    }

    // Validate that the selected hierarchy is accessible
    const userNode = findNodeById(flatOrgData, loggedInUserHierarchy);
    const targetNode = findNodeById(flatOrgData, hierarchyId);
    
    let isAccessible = false;
    
    if (userNode && targetNode) {
      // Check if target is the same hierarchy
      if (hierarchyId === loggedInUserHierarchy) {
        isAccessible = true;
      }
      // Check if target is an immediate child
      else if (targetNode.parent_id === loggedInUserHierarchy) {
        isAccessible = true;
      }
      // Special case for root user assigning to regional EPAs
      else if (loggedInUserHierarchy === "496f1948-559a-428b-86cd-47f546a90933") {
        const rootNode = findNodeById(flatOrgData, loggedInUserHierarchy);
        const immediateChildrenIds = rootNode?.children?.map(child => child.organization_hierarchy_id) || [];
        if (immediateChildrenIds.includes(hierarchyId)) {
          isAccessible = true;
        }
      }
    }

    if (!isAccessible) {
      setToast({
        open: true,
        message: "You don't have permission to assign users to this hierarchy",
        type: "error"
      });
      return;
    }

    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      gender: form.gender || null,
      role_ids: Array.isArray(form.role) ? form.role.flat() : [form.role],
      hierarchy_ids: hierarchyId ? [hierarchyId] : undefined,
      sub_pollution_category_id: form.sub_pollution_category ? [form.sub_pollution_category] : undefined,
      isRegional: true
    };

    try {
      let response;
      if (isEditing && selectedUser?.user_id) {
        response = await UserService.updateUsers(selectedUser.user_id, payload);
      } else {
        response = await UserService.createUsers(payload);
      }

      if (response) {
        setToast({ 
          open: true, 
          message: isEditing ? 'User updated successfully' : 'User created successfully', 
          type: 'success' 
        });

        await fetchUsers(); // Refresh the user list

        setModalOpen(false);
        setForm({});
        setSubmitAttempted(false);
        setIsEditing(false);
        setSelectedUser(null);
      } else {
        setToast({ open: true, message: 'Failed to save user', type: 'error' });
      }
    } catch (err) {
      console.error('Error submitting user:', err);
      setToast({ open: true, message: 'Server error', type: 'error' });
    }
  };

  const handleAddUser = () => {
    if (!loggedInUserHierarchy) {
      setToast({
        open: true,
        message: "Cannot add user: Your hierarchy information is not available",
        type: "error"
      });
      return;
    }

    setIsEditing(false);
    setSelectedUser(null);
    setSubmitAttempted(false);
    setModalOpen(true);

    // Set initial form with logged-in user's hierarchy as default
    setForm({
      isRegional: true,
      organizationHierarchy: loggedInUserHierarchy,
      childHierarchy: '',
      regionalEPA: '',
    });
  };

  const handleModalClose = () => { 
    setModalOpen(false); 
    setForm({}); 
    setIsEditing(false); 
    setSelectedUser(null); 
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl mt-[30px] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-2">
            <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            <p className="text-sm w-60 text-[#A3AED0]">This is the user management of the Super professional.</p>
          </div>

          <div className="flex-1 flex gap-2">
            <HierarchyFilterSelect
              fields={hierarchyFilterFields}
              value={hierarchyFilter}
              onChange={setHierarchyFilter}
              disabled={userTab === "withoutHierarchy"}
              onClear={() => setHierarchyFilter(null)}
            />
            <div className="flex-1 hidden md:flex items-center justify-end gap-3 ">
              <SearchInput value={query} onChange={setQuery} placeholder="Search..." />
            </div>
          </div>
          
          <Button color="green" onClick={handleAddUser}>
            <Plus />
            <span className="hidden md:flex"> Add User</span>
          </Button>
        </div>

        <div className="mt-4">
          <Table columns={defaultUserColumns} rows={slice} actions={actions} />
        </div>

        <Modal
          open={modalOpen}
          width="w-full max-w-2xl"
          onClose={handleModalClose}
          title={isEditing ? "Edit User" : "Add User"}
          description={isEditing ? "Update the user details." : "Fill in the details to add a new user."}
          actions={[
            <Button key="cancel" variant="outline" color="gray" onClick={handleModalClose}>Cancel</Button>,
            <Button
              key="save"
              color="green"
              disabled={submitAttempted}
              onClick={handleFormSubmit}
            >
              {isEditing ? "Update" : "Save"}
            </Button>
          ]}
        >
          <DynamicForm
            fields={filteredFields}
            values={form}
            onChange={handleFormChange}
            schema={addUserSchema}
            submitAttempted={submitAttempted}
          />
        </Modal>

        <div className="mt-3">
          <Pagination page={pageSafe} total={totalPages} onChange={setPage} />
        </div>

        <ToastMessage 
          open={toast.open} 
          type={toast.type} 
          message={toast.message} 
          duration={3500} 
          onClose={() => setToast(t => ({ ...t, open: false }))} 
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