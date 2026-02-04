import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { 
  Filter, X, ChevronDown, ChevronUp, Calendar, 
  AlertCircle, CheckCircle, Clock, XCircle,
  MapPin, BarChart3, PieChart, TrendingUp,
  Download, RefreshCw, Eye, Loader2,
  Users, User, UserPlus, UserCheck, Star,
  Target, Shield, Zap, Globe, Building, Factory, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { fetchAllDashboardData, exportDashboardData } from '../../services/generalDashboard.service';

// Chart components
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export default function GeneralDashboard() {
  const { t } = useTranslation();
  


  // State management
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomerAnalytics, setShowCustomerAnalytics] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    zone: '',
    woreda: '',
    city: '',
    subcity: '',
    pollutionCategory: '',
    subPollutionCategory: '',
    penaltyCategory: '',
    startDate: '',
    endDate: '',
    timeRange: '30d'
  });

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total: 0,
      closed: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0,
      resolutionRate: 0,
      averageResolutionTime: '0 days',
      topPollutionCategory: 'N/A',
      topRegion: 'N/A'
    },
    customerStats: {
      totalCustomers: 0,
      activeCustomers: 0,
      guestCustomers: 0,
      registeredCustomers: 0,
      topReportingCustomers: [],
      customerRetentionRate: 0,
      averageReportsPerCustomer: 0,
      customersWithMultipleReports: 0
    },
    charts: {
      pollutionTrend: [],
      penaltyReasons: [],
      customerReports: [],
      subPollutionBreakdown: [],
      customerEngagement: {
        reportsPerCustomer: [],
        customerActivityTimeline: []
      }
    },
    locations: [],
    loading: false,
    error: null
  });

  const [options, setOptions] = useState({
    regions: [],
    zones: [],
    woredas: [],
    cities: [],
    subcities: [],
    pollutionCategories: [],
    subPollutionCategories: [],
    penaltyCategories: []
  });

  const [filteredOptions, setFilteredOptions] = useState({
    zones: [],
    woredas: [],
    subcities: []
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'under_investigation', label: 'In Investigation', color: 'bg-blue-100 text-blue-800' },
    { value: 'Verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
    { value: 'Under Review', label: 'Under Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'investigation_submitted', label: 'Investigation Submitted', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'Closed', label: 'Closed', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '180d', label: 'Last 6 Months' },
    { value: '365d', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Chart colors
  const chartColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Update filtered options when region or zone changes
  useEffect(() => {
    updateFilteredOptions();
  }, [filters.region, filters.zone, filters.city, options]);

  // Fetch dashboard data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const endpoints = [
        { key: 'regions', url: '/api/regions' },
        { key: 'cities', url: '/api/cities' },
        { key: 'zones', url: '/api/zones' },
        { key: 'woredas', url: '/api/woredas' },
        { key: 'subcities', url: '/api/subcities' },
        { key: 'pollutionCategories', url: '/api/pollution-categories' },
        { key: 'penaltyCategories', url: '/api/penalties' }
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const response = await api.get(url);
            return { key, data: response.data?.data || response.data || [] };
          } catch (error) {
            console.warn(`Failed to fetch ${key}:`, error.message);
            return { key, data: [] };
          }
        })
      );

      const newOptions = {};
      results.forEach(({ key, data }) => {
        newOptions[key] = Array.isArray(data) ? data : [];
      });

      setOptions(prev => ({
        ...prev,
        ...newOptions,
        subPollutionCategories: []
      }));
    } catch (error) {
      console.error('Error fetching filter options:', error);
      setOptions({
        regions: [], zones: [], woredas: [], cities: [], subcities: [],
        pollutionCategories: [], subPollutionCategories: [], penaltyCategories: []
      });
    }
  };

  const updateFilteredOptions = () => {
    const newFilteredOptions = { zones: [], woredas: [], subcities: [] };

    if (filters.region && Array.isArray(options.zones)) {
      newFilteredOptions.zones = options.zones.filter(
        zone => zone.region_id == filters.region
      );
    }

    if (filters.zone && Array.isArray(options.woredas)) {
      newFilteredOptions.woredas = options.woredas.filter(
        woreda => woreda.zone_id == filters.zone
      );
    }

    if (filters.city && Array.isArray(options.subcities)) {
      newFilteredOptions.subcities = options.subcities.filter(
        subcity => subcity.city_id == filters.city
      );
    }

    setFilteredOptions(newFilteredOptions);
  };

  const fetchDashboardData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchAllDashboardData(filters);
      console.log("dataeee",data)
      setDashboardData({
        stats: data.stats || {
          total: 0, closed: 0, inProgress: 0, pending: 0, rejected: 0,
          resolutionRate: 0, averageResolutionTime: '0 days',
          topPollutionCategory: 'N/A', topRegion: 'N/A'
        },
        customerStats: data.customerStats || {
          totalCustomers: 0, activeCustomers: 0, guestCustomers: 0,
          registeredCustomers: 0, topReportingCustomers: [],
          customerRetentionRate: 0, averageReportsPerCustomer: 0,
          customersWithMultipleReports: 0
        },
        charts: data.charts || {
          pollutionTrend: [], penaltyReasons: [], customerReports: [],
          subPollutionBreakdown: [], customerEngagement: {
            reportsPerCustomer: [], customerActivityTimeline: []
          }
        },
        locations: data.locations || [],
        loading: false,
        error: data.error || null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message 
      }));
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters };
    
    if (field === 'region') {
      newFilters.zone = '';
      newFilters.woreda = '';
    } else if (field === 'zone') {
      newFilters.woreda = '';
    } else if (field === 'city') {
      newFilters.subcity = '';
    }
    
    newFilters[field] = value;
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '', region: '', zone: '', woreda: '', city: '', subcity: '',
      pollutionCategory: '', subPollutionCategory: '', penaltyCategory: '',
      startDate: '', endDate: '', timeRange: '30d'
    });
    setFilteredOptions({ zones: [], woredas: [], subcities: [] });
  };

  const handleExportReport = async () => {
    try {
      const success = await exportDashboardData(filters);
      if (success) {
        alert('Report exported successfully!');
      } else {
        alert('Failed to export report. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  // Helper functions
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'timeRange' && value === '30d') return false;
    if (key === 'subPollutionCategory' && value === '') return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;

  const getPollutionTrendData = () => {
    const data = dashboardData.charts.pollutionTrend || [];
    if (data.length === 0) return [];
    return data.slice(-15);
  };

  const getPollutionCategories = () => {
    const data = dashboardData.charts.pollutionTrend || [];
    if (data.length === 0) return ['complaints', 'closed', 'inProgress'];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => key !== 'month' && key !== 'formattedMonth');
  };

  const calculatePending = () => {
    const { total, closed, inProgress, rejected } = dashboardData.stats;
    const pending = total - (closed + inProgress + rejected);
    return Math.max(0, pending);
  };

  const getResolutionRate = () => {
    const { total, closed } = dashboardData.stats;
    if (total === 0) return 0;
    return Math.round((closed / total) * 100);
  };

  const getCustomerAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  console.log(dashboardData.charts.customerEngagement.reportsPerCustomer[0] , "abbbbaaaaa")


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pollution Complaint Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={dashboardData.loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${dashboardData.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Filter className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Dashboard Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="ml-3 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                  </span>
                )}
                {dashboardData.loading && (
                  <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </span>
                )}
                {dashboardData.error && (
                  <span className="ml-3 bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Error loading data
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value || 'all'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Regions</option>
                    {options.regions.map(region => (
                      <option key={region.region_id} value={region.region_id}>
                        {region.region_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Cities</option>
                    {options.cities.map(city => (
                      <option key={city.city_id} value={city.city_id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Range
                  </label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {timeRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pollution Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pollution Category
                  </label>
                  <select
                    value={filters.pollutionCategory}
                    onChange={(e) => handleFilterChange('pollutionCategory', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Categories</option>
                    {options.pollutionCategories.map(category => (
                      <option key={category.pollution_category_id} value={category.pollution_category_id}>
                        {category.pollution_category || category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Penalty Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalty Category
                  </label>
                  <select
                    value={filters.penaltyCategory}
                    onChange={(e) => handleFilterChange('penaltyCategory', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Penalties</option>
                    {options.penaltyCategories.map(penalty => (
                      <option key={penalty.penalty_id} value={penalty.penalty_id}>
                        {penalty.penalty_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional filters */}
              {(filters.region || filters.city) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filters.region && filteredOptions.zones.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone
                      </label>
                      <select
                        value={filters.zone}
                        onChange={(e) => handleFilterChange('zone', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">All Zones</option>
                        {filteredOptions.zones.map(zone => (
                          <option key={zone.zone_id} value={zone.zone_id}>
                            {zone.zone_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {filters.zone && filteredOptions.woredas.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Woreda
                      </label>
                      <select
                        value={filters.woreda}
                        onChange={(e) => handleFilterChange('woreda', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">All Woredas</option>
                        {filteredOptions.woredas.map(woreda => (
                          <option key={woreda.woreda_id} value={woreda.woreda_id}>
                            {woreda.woreda_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {filters.city && filteredOptions.subcities.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcity
                      </label>
                      <select
                        value={filters.subcity}
                        onChange={(e) => handleFilterChange('subcity', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">All Subcities</option>
                        {filteredOptions.subcities.map(subcity => (
                          <option key={subcity.subcity_id} value={subcity.subcity_id}>
                            {subcity.subcity_name || subcity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Main Stats Grid - 6 cards */}
 {/* Status Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
          {/* Total Complaints */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Complaints</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.total.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-100 p-2.5 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">All pollution reports received</p>
          </div>

      
          {/* Pending */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {calculatePending().toLocaleString()}
                </h3>
              </div>
              <div className="bg-orange-100 p-2.5 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">Awaiting assignment</p>
          </div>
          {/* In Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Under Investigation</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.inProgress.toLocaleString()}
                </h3>
              </div>
              <div className="bg-yellow-100 p-2.5 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">Under investigation</p>
          </div>


        
              {/* Closed */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Closed</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.closed.toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-100 p-2.5 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">
              {getResolutionRate()}% resolution rate
            </p>
          </div>
  {/* Rejected */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rejected</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData.stats.rejected.toLocaleString()}
                </h3>
              </div>
              <div className="bg-red-100 p-2.5 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-gray-600 text-xs">Invalid or duplicate reports</p>
          </div>
        </div>

       

     

        {/* Charts Section - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pollution Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pollution Trend</h3>
                <p className="text-gray-600 text-sm">Reports by category over time</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="h-64">
              {getPollutionTrendData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getPollutionTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="formattedMonth" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`${value} reports`, 'Count']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {getPollutionCategories().slice(0, 3).map((category, index) => (
                      <Line 
                        key={category}
                        type="monotone" 
                        dataKey={category} 
                        stroke={chartColors[index % chartColors.length]} 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
                  <p>No trend data available</p>
                  <p className="text-sm mt-1">Apply filters to see data</p>
                </div>
              )}
            </div>
          </div>

          {/* Penalty Reasons Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Penalty Distribution</h3>
                <p className="text-gray-600 text-sm">Types of penalties issued</p>
              </div>
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="h-64">
              {dashboardData.charts.penaltyReasons.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={dashboardData.charts.penaltyReasons}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.charts.penaltyReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} cases`, props.payload.name]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <PieChart className="h-12 w-12 mb-2 opacity-50" />
                  <p>No penalty data available</p>
                  <p className="text-sm mt-1">Apply filters to see data</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reports Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Regional Reports</h3>
                <p className="text-gray-600 text-sm">Reports by region</p>
              </div>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div className="h-64">
              {dashboardData.charts.customerReports.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.charts.customerReports.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="region" 
                      stroke="#6b7280" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="reports" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="closed" name="Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
                  <p>No regional data available</p>
                  <p className="text-sm mt-1">Apply filters to see data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fourth Section - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sub-pollution Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pollution Sub-Categories</h3>
                <p className="text-gray-600 text-sm">Breakdown within main categories</p>
              </div>
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="space-y-6">
              {dashboardData.charts.subPollutionBreakdown && 
               dashboardData.charts.subPollutionBreakdown.length > 0 ? (
                dashboardData.charts.subPollutionBreakdown.map((mainCategory, index) => {
                  // Safety check for subCategories
                  if (!mainCategory.subCategories || !Array.isArray(mainCategory.subCategories)) {
                    return null;
                  }
                  
                  const total = mainCategory.subCategories.reduce((sum, sub) => sum + (sub.value || 0), 0);
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{mainCategory.category || 'Unknown Category'}</span>
                        <span className="text-sm text-gray-500">
                          {total.toLocaleString()} reports
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        {mainCategory.subCategories.map((subCategory, subIndex) => {
                          const percentage = total > 0 ? ((subCategory.value || 0) / total) * 100 : 0;
                          return (
                            <div
                              key={subIndex}
                              className="h-full inline-block transition-all duration-500 hover:opacity-90"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: chartColors[subIndex % chartColors.length]
                              }}
                              title={`${subCategory.name || 'Unknown'}: ${subCategory.value || 0} (${percentage.toFixed(1)}%)`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mainCategory.subCategories.map((subCategory, subIndex) => (
                          <div key={subIndex} className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: chartColors[subIndex % chartColors.length] }}
                            />
                            <span className="text-xs text-gray-600">
                              {subCategory.name || 'Unknown'} ({subCategory.value || 0})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500">
                  <Eye className="h-12 w-12 mb-2 opacity-50" />
                  <p>No sub-category data available</p>
                  <p className="text-sm mt-1">Apply filters to see breakdown</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
{/* Map Section */}
<div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">
        Report Locations
      </h3>
      <p className="text-gray-600 text-sm">
        Geographic distribution of reports
      </p>
    </div>
    <MapPin className="h-5 w-5 text-red-600" />
  </div>

  <div className="h-80 rounded-xl border border-gray-200 overflow-hidden">
    {dashboardData.locations.length > 0 ? (
      <MapContainer
        center={[9.145, 40.4897]} // Ethiopia center
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {dashboardData.locations.map((location, index) => {
          // Check if coordinates exist and are valid
          const lat = location.coordinates?.lat;
          const lng = location.coordinates?.lng;
          
          // Skip locations with invalid coordinates
          if (!lat || !lng || lat === 0 || lng === 0) {
            return null;
          }
          
          return (
            <Marker
              key={location.id || index}
              position={[lat, lng]}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <h4 className="font-semibold text-gray-900">
                    {location.region}
                  </h4>
                  {location.city && location.city !== 'Unknown' && (
                    <p className="text-gray-600">
                      City: {location.city}
                    </p>
                  )}
                  <p className="text-gray-600">
                    Total Reports: {location.complaints || 0}
                  </p>
                  <p className="text-green-600">
                    Closed: {location.closed || 0}
                  </p>
                  <p className="text-gray-500">
                    Resolution Rate: {location.resolutionRate || 0}%
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <MapPin className="h-14 w-14 mb-4 opacity-50" />
        <p>No location data available</p>
        <p className="text-sm mt-1">
          Apply filters to see locations
        </p>
      </div>
    )}
  </div>
  

</div>

        </div>


        {/* Loading Overlay */}
        {dashboardData.loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-700 font-medium">Loading dashboard data...</p>
              <p className="text-gray-500 text-sm mt-2">Fetching complaints and customer analytics</p>
            </div>
          </div>
        )}


           {/* Customer Analytics Section - Collapsible */}
           
       
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <details className="group" open={showCustomerAnalytics}>
            <summary className="flex justify-between items-center cursor-pointer p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
                  <p className="text-gray-600 text-sm">Customer engagement and reporting patterns</p>
                </div>
              </div>
              <ChevronUp className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            
            <div className="p-6">
              {/* Top Reporting Customers */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Top Reporting Customers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.customerStats.topReportingCustomers.length > 0 ? (
                    dashboardData.customerStats.topReportingCustomers.map((customer, index) => (
                      <div key={customer.customer_id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`${getCustomerAvatarColor(customer.full_name)} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}>
                              {getInitials(customer.full_name)}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{customer.full_name}</h5>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Reports:</span>
                            <span className="font-semibold">{customer.reportCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{customer.phone_number}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">First Report:</span>
                            <span className="font-medium">{customer.firstReportDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Report:</span>
                            <span className="font-medium">{customer.lastReportDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Account Status:</span>
                            <span className={`font-medium ${customer.account_status ? 'text-green-600' : 'text-red-600'}`}>
                              {customer.account_status ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No customer data available</p>
                      <p className="text-sm mt-1">Apply filters to view customer analytics</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Engagement Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Reports Per Customer Distribution */}
             <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
  <h4 className="text-md font-semibold text-gray-900 mb-4">
    Reports Per Customer Distribution
  </h4>

  <div className="h-64">
    {dashboardData.charts.customerEngagement.reportsPerCustomer.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dashboardData.charts.customerEngagement.reportsPerCustomer}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X-Axis now uses customerName */}
          <XAxis
            dataKey="customerName"
            tickFormatter={(value) => value || 'N/A'}
            stroke="#6b7280"
            fontSize={12}
          />

          <YAxis stroke="#6b7280" fontSize={12} />

          <Tooltip
            formatter={(value) => [`${value} reports`, 'Count']}
            labelFormatter={(label) => `Customer: ${label}`}
          />

          <Bar
            dataKey="reportCount"
            name="Reports"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No customer distribution data</p>
      </div>
    )}
  </div>
</div>


                {/* Customer Activity Timeline */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Customer Activity Timeline</h4>
                  <div className="h-64">
                    {dashboardData.charts.customerEngagement.customerActivityTimeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.charts.customerEngagement.customerActivityTimeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="formattedMonth"
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip 
                            formatter={(value) => [`${value} reports`, 'Count']}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="reports" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm">No status timeline data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Registered Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.customerStats.registeredCustomers}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserPlus className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Guest Customers</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.customerStats.guestCustomers}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Customers with 2+ Reports</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.customerStats.customersWithMultipleReports}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Avg Engagement Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData.customerStats.averageReportsPerCustomer}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}