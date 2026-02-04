// pages/Reports/GeneralReport.jsx
import React, { useState, useEffect, useMemo } from "react";
import { 
  Download, 
  Filter, 
  Calendar, 
  MapPin, 
  BarChart,
  ChevronDown,
  FileText,
  Users,
  AlertTriangle,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  RefreshCw,
  User,
  MessageSquare,
  List,
  Shield,
  Building,
  PieChart,
  Award
} from "lucide-react";
import Button from "../../components/Buttons/Buttons.jsx";
import Table from "../../components/Table/Table.jsx";
import Pagination from "../../components/Table/Pagination.jsx";
import SearchInput from "../../components/Form/SearchInput.jsx";
import GeneralReportService from "../../services/general-report.service.js";
import RegionService from "../../services/region.service.js";
import services from "../../services/penality.service.js";
const { PenaltySubCategoryService } = services;
import { saveAs } from 'file-saver';
import ChartCard from "../../components/Dashboard/ChartCard.jsx";
import pollutionservices from "../../services/PollutionCategory.service.js";
const { PollutionCategoryService,  } = pollutionservices;
import { useNavigate } from "react-router-dom";

export default function GeneralReport() {

const [pagination, setPagination] = useState({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
});
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubMenu, setActiveSubMenu] = useState('all');
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
const hasRegion = tableData.some(row => row.region);
const hasCity = tableData.some(row => row.city);

const hasZone = tableData.some(row => row.zone);
const hasSubcity = tableData.some(row => row.subcity);

  // Filters
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    regionId: "",
    cityId: "",
    pollutionCategoryId: "",
    subPollutionCategoryId: "",
    reportId:""
  });

  // Dropdown data
  const [dropdowns, setDropdowns] = useState({
    regions: [],
    cities: [],
    pollutionCategories: [],
    subCategories: []
  });

  // Data types for sub-menus
  const dataTypes = [
    { id: 'all', name: 'All Data', icon: <PieChart className="w-4 h-4" /> },
    { id: 'complaints', name: 'Complaints', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'experts', name: 'Experts', icon: <Shield className="w-4 h-4" /> },
    { id: 'customers', name: 'Customers', icon: <User className="w-4 h-4" /> },
    { id: 'cases', name: 'Cases', icon: <FileText className="w-4 h-4" /> },
    { id: 'assignments', name: 'Assignments', icon: <Award className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadReportData();
    loadFilterOptions();
  }, []);

  useEffect(() => {
   
  }, [activeSubMenu]);



const loadReportData = async (pageNumber = 1, appliedFilters = filters) => {
  try {
    setLoading(true);

    const params = {
      page: pageNumber,
      limit: pageSize,
      search: searchQuery,
        ...appliedFilters,
    };
   console.log(params,"paaaaarams")

    const response = await GeneralReportService.getAllGeneralReport(params);

    if (response.success) {
      const normalizedData = (response.data || []).map((item, i) => ({
         number: i + 1,
        report_id: item.report_id,
        status: item.status,
        region: item.region?.region_name || null,
        city: item.city?.city_name || null,
        zone: item.zone?.zone_name || null,
        subcity: item.subcity?.subcity_name || null,
        category: item.pollution_category?.pollution_category || "—",
        sub_category: item.sub_pollution_category?.sub_pollution_category || "—",
        address: item.specific_address || "—",
        created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
        raw: item
      }));

      setTableData(normalizedData);
      setFilteredTableData(normalizedData); // initially, filtered = all
      setPagination(response.pagination);
      setPage(response.pagination.page || pageNumber);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (!tableData.length) return;

  let filtered = [...tableData];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      Object.values(item).some(
        v => v && v.toString().toLowerCase().includes(query)
      )
    );
  }

  setFilteredTableData(filtered);

}, [searchQuery, tableData]);
const handleDateChange = (value, field) => {
  setFilters(prev => ({
    ...prev,
    [field]: value ? new Date(value).toISOString().split('T')[0] : null
  }));
};


const handleFilterChange = (field, value) => {
  setFilters(prev => ({
    ...prev,
    [field]: value
  }));
};
    const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      regionId: "",
      cityId: "",
      pollutionCategoryId: "",
      subPollutionCategoryId: "",
      reportId: ""
    });
    setSearchQuery("");
    setDropdowns(prev => ({ ...prev, subCategories: [] }));
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadReportData();
    } finally {
      setRefreshing(false);
    }
  };

  const actions = {
  onView: (row) => {
    console.log("Clicked view for:", row?.raw?.complaint_id);
    navigate("/reports/detail", { state: { complaint_id: row?.raw?.complaint_id} });
  },
};
  const loadFilterOptions = async () => {
    try {
      const [regionsRes, citiesRes, categoriesRes,penalityRes] = await Promise.all([
        RegionService.getAllRegions(),
        GeneralReportService.getAllCities(),
        PollutionCategoryService.getAllPollutionCategories(),
        PenaltySubCategoryService.getAllPenaltySubCategories()
      ]);
      setDropdowns(prev => ({
        ...prev,
        regions: regionsRes || [],
        cities: citiesRes.data || [],
        pollutionCategories: categoriesRes || [],
        penalityCategories: penalityRes || []
      }));
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

const columns = useMemo(() => {
  const cols = [
    { Header: "Report ID", accessor: "report_id" },
    { Header: "Status", accessor: "status" },
  ];

  if (hasRegion) {
    cols.push({ Header: "Region", accessor: "region" });
  } else if (hasCity) {
    cols.push({ Header: "City", accessor: "city" });
  }



  cols.push(
    { Header: "Category", accessor: "category" },
    { Header: "Sub Category", accessor: "sub_category" },
    { Header: "Created At", accessor: "created_at" },
   
  );

  return cols;
}, [hasRegion, hasCity, hasZone, hasSubcity]);


  const applyFilters = () => {
    let filtered = [...tableData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(query)
        )
      );
    }
    setFilteredTableData(filtered);

  };

  const getColumns = () => {
    const baseColumns = {
      complaints: [
        { Header: "Report ID", accessor: "report_id" },
        { Header: "Status", accessor: "status" },
        { Header: "Customer", accessor: "customer_name" },
        { Header: "Category", accessor: "pollution_category" },
        { Header: "Location", accessor: "location" },
        { Header: "Case Status", accessor: "case_status" },
        { Header: "Created", accessor: "created_at" },
        { 
          Header: "Actions", 
          accessor: "actions",
          Cell: ({ value }) => (
            <button
              onClick={() => handleViewDetails(value)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )
        }
      ],
      experts: [
        { Header: "Name", accessor: "name" },
        { Header: "Email", accessor: "email" },
        { Header: "Specialization", accessor: "specialization" },
        { Header: "Status", accessor: "status" },
        { Header: "Total Assignments", accessor: "total_assignments" },
        { Header: "Active", accessor: "active_assignments" },
        { Header: "Closed", accessor: "closed_assignments" },
        { Header: "Success Rate", accessor: "assignment_rate" },
        { Header: "Last Assignment", accessor: "last_assignment" },
        { 
          Header: "Actions", 
          accessor: "actions",
          Cell: ({ value }) => (
            <button
              onClick={() => handleViewDetails(value)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Profile
            </button>
          )
        }
      ],
      customers: [
        { Header: "Name", accessor: "name" },
        { Header: "Email", accessor: "email" },
        { Header: "Phone", accessor: "phone" },
        { Header: "Status", accessor: "account_status" },
        { Header: "Guest", accessor: "is_guest" },
        { Header: "Total Complaints", accessor: "total_complaints" },
        { Header: "Active", accessor: "active_complaints" },
        { Header: "Resolved", accessor: "closed_complaints" },
        { Header: "Last Complaint", accessor: "last_complaint" },
        { Header: "Joined", accessor: "created_at" },
        { 
          Header: "Actions", 
          accessor: "actions",
          Cell: ({ value }) => (
            <button
              onClick={() => handleViewDetails(value)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Profile
            </button>
          )
        }
      ],
      cases: [
        { Header: "Status", accessor: "status" },
        { Header: "Count", accessor: "count" },
        { 
          Header: "Value", 
          accessor: "value",
          Cell: ({ value }) => (
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (value / Math.max(...filteredTableData.map(d => d.value || 0), 1)) * 100)}%` }}
                />
              </div>
              <span>{value}</span>
            </div>
          )
        },
      ],
      assignments: [
        { Header: "Type", accessor: "type" },
        { Header: "Name", accessor: "name" },
        { Header: "Assignments", accessor: "assignment_count" },
        { 
          Header: "Value", 
          accessor: "value",
          Cell: ({ value }) => (
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (value / Math.max(...filteredTableData.map(d => d.value || 0), 1)) * 100)}%` }}
                />
              </div>
              <span>{value}</span>
            </div>
          )
        },
      ],
      all: [
        { Header: "Type", accessor: "type" },
        { Header: "Name", accessor: "name" },
        { Header: "Status", accessor: "status" },
        { 
          Header: "Value", 
          accessor: "value",
          Cell: ({ value }) => (
            <span className={`font-semibold ${value > 5 ? 'text-green-600' : value > 0 ? 'text-blue-600' : 'text-slate-600'}`}>
              {value}
            </span>
          )
        },
        { 
          Header: "Actions", 
          accessor: "actions",
          Cell: ({ value }) => (
            <button
              onClick={() => handleViewDetails(value)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )
        }
      ]
    };

    return baseColumns[activeSubMenu] || baseColumns.all;
  };

  const handleViewDetails = (item) => {
    console.log("View details:", item);
    const detailType = activeSubMenu.charAt(0).toUpperCase() + activeSubMenu.slice(1);
    alert(`Viewing ${detailType} Details:\n\n${JSON.stringify(item, null, 2)}`);
  };

  const handleExport = async (format) => {
    try {
      let content = "";
      let mimeType = "";
      let filename = `general_report_${activeSubMenu}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        const headers = getColumns().map(col => col.Header);
        const rows = filteredTableData.map(item => 
          headers.map(header => {
            const accessor = getColumns().find(col => col.Header === header)?.accessor;
            const value = item[accessor];
            return value === undefined ? '' : value;
          })
        );
        
        content = [headers, ...rows].map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        mimeType = 'text/csv';
        filename += '.csv';
      } else if (format === 'json') {
        content = JSON.stringify(tableData, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      }

      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, filename);
    } catch (error) {
      console.error("Export error:", error);
      alert('Export failed: ' + error.message);
    }
  };
  if (loading && !tableData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
console.log("dropdowns.penalityCategories",dropdowns.penalityCategories)
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            General Analytics Report
          </h1>
          <p className="text-slate-600 mt-1">
            Comprehensive data analysis with detailed breakdowns
            {tableData?.metadata?.generated_at && (
              <span className="text-sm text-slate-500 block mt-1">
                Last updated: {new Date(tableData.metadata.generated_at).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
       
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          <div className="relative group">
            <Button 
              color="blue" 
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                Export Current View as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                Export Full Report as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
         {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filter Options
            </h3>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All
              </Button>
              <Button color="blue" size="sm"  onClick={() => loadReportData(1, filters)}>
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Range */}
              <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Report ID
        </label>
        <input
          type="text"
          value={filters.reportId || ''}
          onChange={(e) => handleFilterChange('reportId', e.target.value)}
          placeholder="Enter Report ID"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleDateChange(e.target.value, 'startDate')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleDateChange(e.target.value, 'endDate')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Region
              </label>
              <select
                value={filters.regionId}
                onChange={(e) => handleFilterChange('regionId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {dropdowns.regions.map(region => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.region_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pollution Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <BarChart className="w-4 h-4 inline mr-1" />
                Pollution Category
              </label>
              <select
                value={filters.pollutionCategoryId}
                onChange={(e) => handleFilterChange('pollutionCategoryId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {dropdowns.pollutionCategories.map(cat => (
                  <option key={cat.pollution_category_id} value={cat.pollution_category_id}>
                    {cat.pollution_category}
                  </option>
                ))}
              </select>
            </div>
             <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penalty Category
            </label>
            <select
              value={filters.penaltyCategory}
              onChange={(e) => handleFilterChange('penaltyCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Penalties</option>
               {dropdowns.penalityCategories.map(cat => (
                  <option key={cat.penality_sub_category_id} value={cat.penality_sub_category_id}>
                    {cat.issue_type}
                  </option>
                  ))}
            </select>
          </div>
          </div>

          {/* Active Filters */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {filters.regionId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Region: {dropdowns.regions.find(r => r.region_id == filters.regionId)?.region_name}
                </span>
              )}
              {filters.pollutionCategoryId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Category: {dropdowns.pollutionCategories.find(c => c.pollution_category_id == filters.pollutionCategoryId)?.pollution_category}
                </span>
              )}
              {filters.startDate && filters.endDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Date: {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
                </span>
              )}
              {(filters.startDate || filters.endDate || filters.regionId || filters.pollutionCategoryId) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  Active Filters
                </span>
              )}
            </div>
          </div>
        </div>
      )}
       
  <div className="mt-4">
       <Table
  columns={columns}
  rows={tableData}
  actions={actions}
  isreadonly={true}
/>
         <div className="mt-4">
              <Pagination
  page={page}
  total={pagination.totalPages || 1}
  onChange={(newPage) => {
    setPage(newPage);
    loadReportData(newPage, filters);
  }}
/>


                </div>
      </div>
   
    </div>
  );
}