import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import api from '../../services/api'; 


export default function GeneralFilter({ onFilterChange, onClearFilters }) {
  const [showFilters, setShowFilters] = useState(false);
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
    endDate: ''
  });

  const [locationType, setLocationType] = useState(''); // 'region' or 'city'
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
    woredas: []
  });

  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Update dependent options when filters change
  useEffect(() => {
    updateDependentOptions();
  }, [filters.region, filters.city, options]);

  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
      const regionsRes = await api.get('/api/regions');
      const citiesRes = await api.get('/api/cities');
      const zonesRes = await api.get('/api/zones');
      const woredasRes = await api.get('/api/woredas');
      const pollutionRes = await api.get('/api/pollution-categories');
      const penaltyRes = await api.get('/api/penalties');

      setOptions({
        regions: regionsRes.data?.data || regionsRes.data || [],
        cities: citiesRes.data?.data || citiesRes.data || [],
        subcities: [], // Will be loaded when city is selected
        zones: zonesRes.data?.data || zonesRes.data || [],
        woredas: woredasRes.data?.data || woredasRes.data || [],
        pollutionCategories: pollutionRes.data?.data || pollutionRes.data || [],
        subPollutionCategories: [], // You'll need an API for this
        penaltyCategories: penaltyRes.data?.data || penaltyRes.data || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDependentOptions = () => {
    const newFilteredOptions = {
      zones: [],
      woredas: []
    };

    // Filter zones based on selected region
    if (filters.region) {
      newFilteredOptions.zones = options.zones.filter(
        zone => zone.region_id === filters.region
      );
    }

    // Filter woredas based on selected zone
    if (filters.zone) {
      newFilteredOptions.woredas = options.woredas.filter(
        woreda => woreda.zone_id === filters.zone
      );
    }

    setFilteredOptions(newFilteredOptions);
  };

  const fetchSubcities = async (cityId) => {
    try {
      const subcitiesRes = await api.get(`/api/subcities`);
      setOptions(prev => ({
        ...prev,
        subcities: subcitiesRes.data?.subcities || subcitiesRes.data || []
      }));
    } catch (error) {
      console.error('Error fetching subcities:', error);
      setOptions(prev => ({
        ...prev,
        subcities: []
      }));
    }
  };

  const handleLocationTypeChange = (type) => {
    setLocationType(type);
    
    // Reset location filters when switching types
    const newFilters = { ...filters };
    if (type === 'region') {
      newFilters.city = '';
      newFilters.subcity = '';
    } else if (type === 'city') {
      newFilters.region = '';
      newFilters.zone = '';
      newFilters.woreda = '';
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters };
    
    // Reset dependent filters when parent changes
    if (field === 'region') {
      newFilters.zone = '';
      newFilters.woreda = '';
      setLocationType('region');
    } else if (field === 'city') {
      newFilters.subcity = '';
      setLocationType('city');
      if (value) {
        fetchSubcities(value);
      } else {
        setOptions(prev => ({ ...prev, subcities: [] }));
      }
    } else if (field === 'zone') {
      newFilters.woreda = '';
    }
    
    newFilters[field] = value;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
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
      endDate: ''
    };
    setFilters(clearedFilters);
    setLocationType('');
    onClearFilters();
    setFilteredOptions({
      zones: [],
      woredas: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Count number of active filters for badge
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-2">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">General Filters</h3>
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {showFilters ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide Filters
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Filters
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters Section - Collapsible */}
      {showFilters && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Location Type Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region - Always visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Regions</option>
                    {options.regions.map(region => (
                      <option key={region.region_id} value={region.region_id}>
                        {region.region_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City - Always visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Cities</option>
                    {options.cities.map(city => (
                      <option key={city.city_id} value={city.city_id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>
                </div>


                 {filters.city && (
                     <>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subcity
                        </label>
                        <select
                          value={filters.subcity}
                          onChange={(e) => handleFilterChange('subcity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Subcities</option>
                          {options.subcities.map(subcity => (
                            <option key={subcity.subcity_id} value={subcity.subcity_id}>
                              {subcity.subcity_name || subcity.name}
                            </option>
                          ))}
                        </select>
                      </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Woreda
                          </label>
                          <select
                            value={filters.woreda}
                            onChange={(e) => handleFilterChange('woreda', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">
                              {!filters.zone ? 'Select zone first' : 'All Woredas'}
                            </option>
                            {filteredOptions.woredas.map(woreda => (
                              <option key={woreda.woreda_id} value={woreda.woreda_id}>
                                {woreda.woreda_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        </>
                    )}
                {(filters.region || filters.city) && (
              
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Region-based filters */}
                    {filters.region && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zone
                          </label>
                          <select
                            value={filters.zone}
                            onChange={(e) => handleFilterChange('zone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">All Zones</option>
                            {filteredOptions.zones.map(zone => (
                              <option key={zone.zone_id} value={zone.zone_id}>
                                {zone.zone_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Woreda
                          </label>
                          <select
                            value={filters.woreda}
                            onChange={(e) => handleFilterChange('woreda', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">
                              {!filters.zone ? 'Select zone first' : 'All Woredas'}
                            </option>
                            {filteredOptions.woredas.map(woreda => (
                              <option key={woreda.woreda_id} value={woreda.woreda_id}>
                                {woreda.woreda_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* City-based filters */}
                   
                  </div>
              )}

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pollution Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pollution Category
                  </label>
                  <select
                    value={filters.pollutionCategory}
                    onChange={(e) => handleFilterChange('pollutionCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Penalties</option>
                    {options.penaltyCategories.map(penalty => (
                      <option key={penalty.penalty_id} value={penalty.penalty_id}>
                        {penalty.penalty_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Location Filters */}
              
            </div>
          )}
        </>
      )}

    
    </div>
  );
}