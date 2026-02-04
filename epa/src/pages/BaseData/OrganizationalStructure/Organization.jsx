import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  FolderTree,
  Plus,
  Download,
  Loader2,
  Table as TableIcon,
  TreePine,
  Eye,
  ChevronUp,
} from "lucide-react";

import OrganizationHierarchyService from "../../../services/OrganizationHierarchy.service.js";
import RegionService from "../../../services/basedata.service.js";
import FilterTab from "../../../components/Form/FilterTab.jsx";
import Table from "../../../components/Table/Table.jsx";

/* -----------------------------
   UI COMPONENTS
-------------------------------- */

function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm transition-all
      ${hover ? "hover:shadow-md hover:border-[#387E53]/30 hover:-translate-y-0.5" : ""}
      ${className}`}
    >
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function Button({
  children,
  size = "md",
  variant = "default",
  className = "",
  ...props
}) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2.5",
  };

  const variantStyles = {
    default: "bg-[#387E53] text-white hover:bg-[#2e6b45]",
    outline: "border border-[#387E53] text-[#387E53] hover:bg-[#387E53]/5",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition
      ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, level }) {
  const colors = {
    1: "bg-purple-50 text-purple-700",
    2: "bg-blue-50 text-blue-700",
    3: "bg-emerald-50 text-emerald-700",
    4: "bg-amber-50 text-amber-700",
    5: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
      {children}
    </span>
  );
}

/* -----------------------------
   HELPERS
-------------------------------- */

function getHierarchyIcon(type) {
  const icons = {
    Region: "🏢",
    City: "🏢",
    Subcity: "🏢",
    Zone: "🏢",
    Woreda:"🏢",
    Organization: "🏛️",
  };
  return icons[type] || "🏛️";
}

function determineHierarchyType(node) {
  if (node.isRegional) {
    if (node.woreda_id) return "Woreda";
    if (node.zone_id) return "Zone";
    if (node.region_id) return "Region";
  }
  return "Organization";
}

/* -----------------------------
   RECURSIVE NODE (Tree View)
-------------------------------- */

function HierarchyNode({ node, level = 1, onAddChild, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children?.length > 0;
  const nodeType = determineHierarchyType(node);
  console.log(nodeType , "nodeType")

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative z-10 mb-6">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge level={level}>Level {level}</Badge>
        </div>

        <Card hover className="border-t-4 border-[#387E53] min-w-[280px]">
          <CardContent className="p-3">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#387E53]/10 rounded-md text-lg">
                {getHierarchyIcon(nodeType)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <button
                      onClick={() => setOpen(!open)}
                      className="p-1 hover:bg-slate-100 rounded -ml-1"
                    >
                      {open ? (
                        <ChevronDown size={16} className="text-[#387E53]" />
                      ) : (
                        <ChevronRight size={16} className="text-[#387E53]" />
                      )}
                    </button>
                  )}

                  <h3 className="font-medium text-sm text-slate-800 truncate">
                    {node.hierarchy_name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    ({nodeType})
                  </span>
                </div>
                
                 {node.region?.region_name && nodeType === "Region" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Region: {node.region.region_name}
                </div>)}
          {node.zone?.zone_name && nodeType === "Zone" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Zone: {node.zone?.zone_name}
                </div>)} 
                  {node.woreda?.woreda_name &&nodeType === "Woreda" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Woreda: {node.woreda.woreda_name}
                </div>)}

              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onAddChild(node)}
                  title="Add Child"
                  className="bg-[#387E53]/10 hover:bg-[#387E53]/20"
                >
                  <Plus size={14} className="text-[#387E53]" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(node)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </Button>

                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(node)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChildren && open && (
        <div className="relative w-full flex justify-center mb-4">
          <div className="absolute top-0 w-px h-6 bg-[#387E53]/30" />
          <div className="absolute top-6 w-2 h-2 bg-[#387E53] rounded-full" />
        </div>
      )}

      {hasChildren && open && (
        <div className="relative w-full overflow-x-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-[#387E53]/20" />

          <div className="inline-flex gap-4 mt-4 px-4">
            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <div className="absolute -top-4 w-px h-4 bg-[#387E53]/20" />
                <HierarchyNode
                  node={child}
                  level={level + 1}
                  onAddChild={onAddChild}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   TREE VIEW COMPONENT
-------------------------------- */

function TreeView({ hierarchies, onAddChild, onEdit, onDelete }) {
  return (
    <Card className="p-8 overflow-x-auto">
      {hierarchies.length === 0 ? (
        <div className="text-center py-16">
          <FolderTree size={40} className="mx-auto text-slate-400" />
          <p className="mt-4 text-slate-500">No hierarchy found</p>
          <Button
            className="mt-4"
            onClick={() => onAddChild(null)}
          >
            <Plus size={16} /> Create Root Hierarchy
          </Button>
        </div>
      ) : (
        hierarchies.map((root, i) => (
          <div key={i} className="flex justify-center">
            <HierarchyNode
              node={root}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))
      )}
    </Card>
  );
}

/* -----------------------------
   TABLE VIEW COMPONENT - Hierarchical with expandable rows
-------------------------------- */

function TableView({ allHierarchies, onEdit, onDelete, onAddChild }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Function to render hierarchical rows
  const renderHierarchicalRows = (nodes, depth = 0, parentId = null) => {
    if (!nodes || !Array.isArray(nodes)) {
      return [];
    }

    let rows = [];
    nodes.forEach(node => {
      if (!node) return;

      const nodeType = determineHierarchyType(node);
      const id = node.organization_hierarchy_id;
      const hasChildren = node.children?.length > 0;
      const isExpanded = expandedRows.has(id);

      // Main row
      rows.push({
        ...node,
        nodeType,
        depth,
        id,
        parentId,
        hasChildren,
        isExpanded,
        type: nodeType,
        hierarchy_name: node.hierarchy_name || "Unnamed",
        organization_hierarchy_id: id,
        parent_id: node.parent_id || null,
        region_name: node.region?.region_name || "",
        zone_name: node.zone?.zone_name || "",
        woreda_name: node.woreda?.woreda_name || "",
      });

      // Render children if expanded
      if (isExpanded && hasChildren) {
        rows = rows.concat(renderHierarchicalRows(node.children, depth + 1, id));
      }
    });

    return rows;
  };

  const flattenedData = renderHierarchicalRows(allHierarchies || []);

  const columns = [
    {
      Header: "",
      accessor: "expand",
      width: 50,
      Cell: (params) => {
        const row = params?.row || {};
        const hasChildren = row.hasChildren;
        const isExpanded = row.isExpanded;
        
        if (!hasChildren) return null;
        
        return (
          <button
            onClick={() => toggleRow(row.id)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            {isExpanded ? (
              <ChevronUp size={16} className="text-[#387E53]" />
            ) : (
              <ChevronDown size={16} className="text-[#387E53]" />
            )}
          </button>
        );
      },
    },
    {
      Header: "Level",
      accessor: "depth",
      Cell: (params) => {
        const value = params?.value ?? 0;
        const row = params?.row || {};
        const depth = row.depth || 0;
        
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            <div className="w-4 h-4 rounded-full bg-[#387E53]/20 flex items-center justify-center">
              <span className="text-xs font-medium">{value + 1}</span>
            </div>
            <Badge level={Math.min(value + 1, 5)}>Level {value + 1}</Badge>
          </div>
        );
      },
    },
    {
      Header: "Name",
      accessor: "hierarchy_name",
      Cell: (params) => {
        console.log(params , "params")
        const value = params?.value || "Unnamed";
        const row = params?.row || {};
        const type = row.type || "Organization";
        const depth = row.depth || 0;
        const newNodeType = row.nodeType
        return (
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            <div className="text-lg">
              {getHierarchyIcon(type)}
            </div>
            <div>
              <div className="font-medium">{value}</div>
{ newNodeType === "Region" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Region: {row?.region?.region_name}
                </div>)}
          { newNodeType === "Zone" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Zone: {row?.zone?.zone_name}
                </div>)} 
                  {newNodeType === "Woreda" &&(
                <div className="mt-1 text-xs text-slate-500">
                   Woreda: {row?.woreda?.woreda_name}
                </div>)}
             
            </div>
          </div>
        );
      },
    },
    
  ];

  const actions = {
    onView: (row) => toggleRow(row.id),
    onEdit: (row) => onEdit(row),
    onDelete: (row) => onDelete(row),
    onAddChild: (row) => onAddChild(row),
  };

  return (
    <div className="mt-4">
      <div className="text-sm text-slate-500 mb-4">
        Showing {flattenedData.length} hierarchy items • Click <Eye size={14} className="inline ml-1" /> to view children
      </div>
      
      {flattenedData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <TableIcon size={40} className="mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500">No hierarchy data available</p>
          <Button
            className="mt-4"
            onClick={() => onAddChild(null)}
          >
            <Plus size={16} /> Add Root Hierarchy
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#387E53] text-white font-medium text-sm">
              {columns.map((col, colIndex) => (
                <div key={col.accessor || col.Header} className="flex-1 min-w-[120px]">
                  {col.Header}
                </div>
              ))}
              <div className="flex-1 min-w-[120px]">Actions</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y">
              {flattenedData.map((row, idx) => (
                <div
                  key={row.id}
                  className={`flex items-center justify-between px-6 py-4 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <div key={col.accessor} className="flex-1 min-w-[120px]">
                      {col.Cell ? col.Cell({ value: row[col.accessor], row }) : row[col.accessor]  || '-'}
                    </div>
                  ))}
                  
                  <div className="flex-1 min-w-[120px] flex items-center justify-start gap-2">
                    {row.hasChildren && (
                      <button
                        onClick={() => toggleRow(row.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-md"
                        title={row.isExpanded ? "Collapse" : "Expand"}
                      >
                        <Eye className="w-4 h-4 text-[#387E53]" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => actions.onAddChild(row)}
                      className="p-1.5 hover:bg-gray-100 rounded-md"
                      title="Add Child"
                    >
                      <Plus className="w-4 h-4 text-[#387E53]" />
                    </button>
                    
                    <button
                      onClick={() => actions.onEdit(row)}
                      className="p-1.5 hover:bg-gray-100 rounded-md"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-[#387E53]" />
                    </button>
                    
                    <button
                      onClick={() => actions.onDelete(row)}
                      className="p-1.5 hover:bg-gray-100 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------
   MAIN COMPONENT
-------------------------------- */

export default function HierarchyTree() {
  const [hierarchies, setHierarchies] = useState([]);
  const [allHierarchies, setAllHierarchies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [hierarchyName, setHierarchyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [viewMode, setViewMode] = useState("tree"); // 'tree' or 'table'

  // Additional state
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isRegional, setIsRegional] = useState(false);
  const [woredas, setWoredas] = useState([]);
  const [selectedWoreda, setSelectedWoreda] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  const viewOptions = [
    { key: "tree", label: "Tree View", icon: <TreePine size={16} /> },
    { key: "table", label: "Table View", icon: <TableIcon size={16} /> },
  ];

  // Check if parent is regional to lock checkbox
  const isParentRegional = selectedParent?.isRegional;

  // 🔹 FETCH REGIONS ONLY WHEN NEEDED
  useEffect(() => {
    if (isRegional && regions.length === 0) {
      (async () => {
        try {
          const data = await RegionService.RegionService.getAllRegions();
          if (data) setRegions(data);
        } catch (error) {
          console.error("Error fetching regions:", error);
        }
      })();
    }
  }, [isRegional]);

  useEffect(() => {
    if (!openModal) return;

    const regionId =
      selectedParent?.isRegional
        ? selectedParent.region_id
        : isRegional
        ? selectedRegion
        : null;

    if (!regionId) return;

    (async () => {
      try {
        const data = await RegionService.ZoneService.getZonesByRegion(regionId);
        if (data) setZones(data);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    })();
  }, [openModal, selectedParent, isRegional, selectedRegion]);

  useEffect(() => {
    if (!selectedZone || zones.length === 0) {
      setWoredas([]);
      setSelectedWoreda("");
      return;
    }

    const zone = zones.find(z => z.zone_id === selectedZone);
    setWoredas(zone?.woreda || []);
  }, [selectedZone, zones]);

  const handleSaveHierarchy = async () => {
    if (!hierarchyName) {
      alert("Please enter a hierarchy name");
      return;
    }

    if (!isEditMode && !selectedParent && hierarchies.length > 0) {
      alert("Root hierarchy already exists. Please add under an existing level.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        hierarchy_name: hierarchyName,
        parent_id: selectedParent
          ? selectedParent.organization_hierarchy_id
          : null,
        region_id: selectedParent?.isRegional
          ? selectedParent.region_id
          : isRegional
          ? selectedRegion
          : null,
        zone_id: selectedZone || null,
        woreda_id: selectedWoreda || null,
        isRegional: selectedParent?.isRegional || isRegional,
        city_id: null,
        subcity_id: null,
      };

      if (isEditMode) {
        await OrganizationHierarchyService.updateHierarchy(editingId, payload);
      } else {
        await OrganizationHierarchyService.createHierarchy(payload);
      }

      // Refresh data
      await loadHierarchies();
      
      // Reset form
      resetForm();
      
      alert(isEditMode ? "Hierarchy updated successfully!" : "Hierarchy created successfully!");
    } catch (err) {
      console.error("Error saving hierarchy:", err);
      alert("Error saving hierarchy: " + (err.message || "Please try again"));
    } finally {
      setSaving(false);
    }
  };

  const loadHierarchies = async () => {
    try {
      const res = await OrganizationHierarchyService.getAllHierarchies();
      const data = res?.data ?? res ?? [];
      console.log("Loaded hierarchies:", data); // Debug log
      setHierarchies(data.filter(h => !h.parent_id));
      setAllHierarchies(data);
    } catch (error) {
      console.error("Error loading hierarchies:", error);
    }
  };

  const resetForm = () => {
    setHierarchyName("");
    setSelectedParent(null);
    setSelectedRegion("");
    setSelectedZone("");
    setSelectedWoreda("");
    setIsRegional(false);
    setIsEditMode(false);
    setEditingId(null);
    setEditData(null);
    setOpenModal(false);
  };

  const handleEdit = async (node) => {
    try {
      if (!node || !node.organization_hierarchy_id) {
        alert("Invalid node selected for editing");
        return;
      }

      const res = await OrganizationHierarchyService.getHierarchyById(node.organization_hierarchy_id);
      const data = res?.data ?? res;
      if (!data) {
        alert("Failed to load hierarchy data");
        return;
      }

      setIsEditMode(true);
      setEditingId(node.organization_hierarchy_id);
      setOpenModal(true);

      // Set form values
      setHierarchyName(data.hierarchy_name || "");
      setIsRegional(!!data.region_id || data.isRegional);
      
      // If there's a parent, set it
      if (data.parent_id) {
        setSelectedParent({
          organization_hierarchy_id: data.parent_id,
          hierarchy_name: data.parent?.hierarchy_name || "Parent",
          isRegional: data.parent?.isRegional || !!data.parent?.region_id,
          region_id: data.parent?.region_id || data.region_id,
        });
      } else {
        setSelectedParent(null);
      }

      // Save edit data for cascading selects
      setEditData({
        region_id: data.region_id,
        zone_id: data.zone_id,
        woreda_id: data.woreda_id,
      });

      // Trigger region → zone flow
      if (data.region_id) {
        setSelectedRegion(data.region_id);
      }
    } catch (error) {
      console.error("Error loading hierarchy for edit:", error);
      alert("Failed to load hierarchy data");
    }
  };

  const handleDelete = async (node) => {
    if (!window.confirm(`Are you sure you want to delete "${node.hierarchy_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await OrganizationHierarchyService.deleteHierarchy(node.organization_hierarchy_id);
      
      // Refresh data
      await loadHierarchies();
      
      alert("Hierarchy deleted successfully");
    } catch (err) {
      console.error("Error deleting hierarchy:", err);
      alert("Error deleting hierarchy: " + (err.message || "Please try again"));
    }
  };

  // Handle edit data cascading
  useEffect(() => {
    if (!editData || zones.length === 0) return;

    if (editData.zone_id) {
      setSelectedZone(editData.zone_id);
    }
  }, [zones, editData]);

  useEffect(() => {
    if (!editData || woredas.length === 0) return;

    if (editData.woreda_id) {
      setSelectedWoreda(editData.woreda_id);
    }

    // Cleanup after hydration
    setTimeout(() => setEditData(null), 100);
  }, [woredas, editData]);

  // Load initial data
  useEffect(() => {
    loadHierarchies().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#387E53]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Hierarchy</h1>
        
        <div className="flex align-center items-center gap-4">
          {/* View Mode Tabs */}
          <FilterTab
            options={viewOptions}
            value={viewMode}
            onChange={setViewMode}
          />
          
          {/* Always show add root button */}
          <Button
            onClick={() => {
              setSelectedParent(null);
              setOpenModal(true);
            }}
          >
            <Plus size={16} /> Add Root
          </Button>
        </div>
      </div>

      

      {/* Main Content */}
      {viewMode === "tree" ? (
        <TreeView
          hierarchies={hierarchies}
          onAddChild={(node) => {
            setSelectedParent(node);
            setOpenModal(true);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <TableView
          allHierarchies={hierarchies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={(node) => {
            setSelectedParent(node);
            setOpenModal(true);
          }}
        />
      )}

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditMode
                ? "Edit Organization Level"
                : selectedParent
                ? `Add under "${selectedParent.hierarchy_name}"`
                : "Add Organization Level"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Hierarchy Name *
              </label>
              <input
                type="text"
                value={hierarchyName}
                onChange={(e) => setHierarchyName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53]"
                placeholder="Enter hierarchy name"
              />
            </div>

            {/* Region Toggle - Show for non-root nodes */}
            {(selectedParent || isEditMode) && (
              <div className="space-y-4 mb-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isParentRegional || isRegional}
                    onChange={(e) => {
                      if (!isParentRegional) {
                        setIsRegional(e.target.checked);
                        setSelectedRegion("");
                        setSelectedZone("");
                        setSelectedWoreda("");
                      }
                    }}
                    className="rounded"
                    disabled={isParentRegional} // Disable if parent is regional
                  />
                  <span className={isParentRegional ? "text-slate-400" : ""}>
                    Is Regional {isParentRegional ? "(Locked from parent)" : ""}
                  </span>
                </label>

                {(isParentRegional || isRegional) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Region {isParentRegional ? "(Locked)" : ""}
                    </label>
                    <select
                      value={selectedParent?.region_id || selectedRegion}
                      onChange={(e) => {
                        if (!isParentRegional) {
                          setSelectedRegion(e.target.value);
                          setSelectedZone("");
                          setSelectedWoreda("");
                        }
                      }}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53] ${
                        isParentRegional ? "bg-slate-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isParentRegional}
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r.region_id} value={r.region_id}>
                          {r.region_name}
                        </option>
                      ))}
                    </select>
                  
                  </div>
                )}

                {((isParentRegional && selectedParent?.region_id) || (isRegional && selectedRegion)) && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Zone
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53]"
                    >
                      <option value="">Select Zone</option>
                      {zones.map((z) => (
                        <option key={z.zone_id} value={z.zone_id}>
                          {z.zone_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedZone && woredas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Woreda
                    </label>
                    <select
                      value={selectedWoreda}
                      onChange={(e) => setSelectedWoreda(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#387E53]"
                    >
                      <option value="">Select Woreda</option>
                      {woredas.map((w) => (
                        <option key={w.woreda_id} value={w.woreda_id}>
                          {w.woreda_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={resetForm}
              >
                Cancel
              </Button>

              <Button
                disabled={
                  !hierarchyName ||
                  saving ||
                  ((isParentRegional || isRegional) && !selectedRegion && !selectedParent?.region_id)
                }
                onClick={handleSaveHierarchy}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isEditMode ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}