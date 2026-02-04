import api from './api';

/**
 * Enhanced Dashboard Data Service with Customer Analytics
 */

const dashboardCache = {
  stats: null,
  charts: null,
  locations: null,
  customerStats: null,
  lastFetchTime: null,
  CACHE_DURATION: 2 * 60 * 1000,
};

/**
 * Transform complaints into comprehensive statistics including customer data
 */
const transformComplaintsToStats = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return {
      total: 0,
      closed: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0,
      statusCounts: {},
      regionStats: [],
      pollutionStats: [],
      subPollutionStats: [],
      customerStats: {
        totalCustomers: 0,
        activeCustomers: 0,
        guestCustomers: 0,
        topReportingCustomers: [],
        customerRetentionRate: 0,
        averageReportsPerCustomer: 0
      }
    };
  }

  const total = complaints.length;
  const customerMap = new Map();
  const statusCounts = {
    pending: 0,
    under_investigation: 0,
    investigation_submitted: 0,
    Verified: 0,
    'Under Review': 0,
    Closed: 0,
    Rejected: 0,
  };

  const regionCounts = {};
  const categoryCounts = {};
  const subCategoryCounts = {};

  // Process each complaint
  complaints.forEach(complaint => {
    // Status counts
    const status = complaint.status?.toLowerCase() || 'pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // Region counts
    const regionName = complaint.region?.region_name || complaint.city?.city_name || 'Unknown';
    regionCounts[regionName] = (regionCounts[regionName] || 0) + 1;

    // Category counts
    const categoryName = complaint.pollution_category?.pollution_category || 'Unknown';
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;

    // Sub-category counts
    const subCategoryName = complaint.sub_pollution_category?.sub_pollution_category || 'No Subcategory';
    subCategoryCounts[subCategoryName] = (subCategoryCounts[subCategoryName] || 0) + 1;

    console.log(complaint.customer , "")
    // Customer statistics
    if (complaint.customer) {
      const customerId = complaint.customer.customer_id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customer_id: customerId,
          full_name: complaint.customer.full_name,
          email: complaint.customer.email,
          phone_number: complaint.customer.phone_number,
          account_status: complaint.customer.account_status,
          is_guest: complaint.customer.is_guest,
          reportCount: 0,
          firstReportDate: new Date(complaint.created_at),
          lastReportDate: new Date(complaint.created_at)
        });
      }
      
      const customer = customerMap.get(customerId);
      customer.reportCount += 1;
      
      const reportDate = new Date(complaint.created_at);
      if (reportDate < customer.firstReportDate) {
        customer.firstReportDate = reportDate;
      }
      if (reportDate > customer.lastReportDate) {
        customer.lastReportDate = reportDate;
      }
    }
  });

  // Calculate status summary
  const closed = statusCounts.Closed || 0;
  const inProgress = (statusCounts.under_investigation || 0) + 
                    (statusCounts['under review'] || 0) + 
                    (statusCounts.verified || 0);
  const pending = statusCounts.pending || 0;
  const rejected = statusCounts.Rejected || 0;

  // Calculate customer statistics
  const customers = Array.from(customerMap.values());
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.reportCount > 1).length;
  const guestCustomers = customers.filter(c => c.is_guest).length;
  
  // Calculate average reports per customer
  const averageReportsPerCustomer = totalCustomers > 0 ? (total / totalCustomers).toFixed(1) : 0;
  
  // Calculate retention rate (customers with multiple reports)
  const customerRetentionRate = totalCustomers > 0 ? 
    (activeCustomers / totalCustomers * 100).toFixed(1) : 0;

  // Get top reporting customers
  const topReportingCustomers = customers
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 3)
    .map(customer => ({
      ...customer,
      firstReportDate: customer.firstReportDate.toISOString().split('T')[0],
      lastReportDate: customer.lastReportDate.toISOString().split('T')[0]
    }));

  return {
    total,
    closed,
    inProgress,
    pending,
    rejected,
    statusCounts,
    regionStats: Object.entries(regionCounts).map(([region, count]) => ({ region, count })),
    pollutionStats: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
    subPollutionStats: Object.entries(subCategoryCounts).map(([subCategory, count]) => ({ subCategory, count })),
    customerStats: {
      totalCustomers,
      activeCustomers,
      guestCustomers,
      registeredCustomers: totalCustomers - guestCustomers,
      topReportingCustomers,
      customerRetentionRate: parseFloat(customerRetentionRate),
      averageReportsPerCustomer: parseFloat(averageReportsPerCustomer),
      customersWithMultipleReports: activeCustomers
    }
  };
};

/**
 * Transform complaints into trend data for charts
 */
const transformComplaintsToTrendData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return [];
  }

  const trendMap = new Map();
  
  // Group by date (monthly)
  complaints.forEach(complaint => {
    const date = new Date(complaint.created_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!trendMap.has(monthKey)) {
      trendMap.set(monthKey, {
        month: monthKey,
        formattedMonth: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
        complaints: 0,
        closed: 0,
        inProgress: 0
      });
    }
    
    const trend = trendMap.get(monthKey);
    trend.complaints += 1;
    
    // Categorize by status
    const status = complaint.status?.toLowerCase() || 'pending';
    if (status === 'closed') {
      trend.closed += 1;
    } else if (['under_investigation', 'under review', 'verified'].includes(status)) {
      trend.inProgress += 1;
    }
  });
  
  // Convert to array and sort by date
  return Array.from(trendMap.values())
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Transform complaints into penalty reason data
 */
const transformComplaintsToPenaltyData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return [];
  }

  const penaltyMap = new Map();
  
  complaints.forEach(complaint => {
    if (complaint.penalty_reason) {
      const reason = complaint.penalty_reason;
      penaltyMap.set(reason, (penaltyMap.get(reason) || 0) + 1);
    }
  });
  
  return Array.from(penaltyMap.entries())
    .map(([reason, count]) => ({
      name: reason,
      value: count,
      percentage: Math.round((count / complaints.length) * 100)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 reasons
};

/**
 * Transform complaints into region data
 */
const transformComplaintsToRegionData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return [];
  }

  const regionMap = new Map();
  
  complaints.forEach(complaint => {
    const regionName = complaint.region?.region_name || complaint.city?.city_name || 'Unknown';
    const regionKey = regionName;
    
    if (!regionMap.has(regionKey)) {
      regionMap.set(regionKey, {
        region: regionName,
        reports: 0,
        closed: 0,
        coordinates: {
          lat: complaint.latitude || 0,
          lng: complaint.longitude || 0
        }
      });
    }
    
    const region = regionMap.get(regionKey);
    region.reports += 1;
    
    if (complaint.status?.toLowerCase() === 'closed') {
      region.closed += 1;
    }
  });
  
  return Array.from(regionMap.values())
    .sort((a, b) => b.reports - a.reports);
};

/**
 * Transform complaints into sub-pollution category breakdown
 * Returns structure expected by UI: [{ category, subCategories: [{name, value}] }]
 */
const transformComplaintsToSubPollutionData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return [];
  }

  const categoryMap = new Map();
  
  complaints.forEach(complaint => {
    const mainCategory = complaint.pollution_category?.pollution_category || 'Unknown';
    const subCategory = complaint.sub_pollution_category?.sub_pollution_category || 'No Subcategory';
    
    if (!categoryMap.has(mainCategory)) {
      categoryMap.set(mainCategory, new Map());
    }
    
    const subCategoryMap = categoryMap.get(mainCategory);
    subCategoryMap.set(subCategory, (subCategoryMap.get(subCategory) || 0) + 1);
  });
  
  // Convert to the structure expected by UI
  return Array.from(categoryMap.entries())
    .map(([category, subCategoryMap]) => {
      const subCategories = Array.from(subCategoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      return {
        category,
        subCategories,
        total: subCategories.reduce((sum, sub) => sum + sub.value, 0)
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3); // Top 3 main categories
};

/**
 * Transform complaints into location data
 */
/**
 * Transform complaints into location data
 */
const transformComplaintsToLocationData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return [];
  }

  const locationMap = new Map();
  
  // Ethiopian regional coordinates (approximate centers)
  const ethiopianRegionCoords = {
    'Addis Ababa': [9.02497, 38.74689],
    'Afar': [11.755938, 40.958683],
    'Amhara': [11.349424, 37.978458],
    'Benishangul-Gumuz': [10.780288, 35.565786],
    'Dire Dawa': [9.589229, 41.87019],
    'Gambela': [8.128333, 34.5625],
    'Harari': [9.313457, 42.118247],
    'Oromia': [8.52607, 39.25447],
    'Sidama': [6.827755, 38.986927],
    'Somali': [7.116667, 44.266667],
    'South West Ethiopia': [7.05307, 36.11055],
    'Southern Nations, Nationalities, and Peoples': [6.515691, 36.954107],
    'Tigray': [13.666667, 39.433333]
  };
  
  complaints.forEach(complaint => {
    const region = complaint.region?.region_name || 'Unknown';
    const city = complaint.city?.city_name || 'Unknown';
    const subcity = complaint.subcity?.subcity_name || 'Unknown';
    const woreda = complaint.woreda?.woreda_name || 'Unknown';
    
    const locationKey = `${region}|${city}|${subcity}|${woreda}`;
    
    if (!locationMap.has(locationKey)) {
      // Get coordinates from complaint or use regional defaults
      let lat = complaint.latitude;
      let lng = complaint.longitude;
      
      // If no coordinates in complaint, use regional defaults
      if (!lat || !lng || lat === 0 || lng === 0) {
        const regionCoords = ethiopianRegionCoords[region];
        if (regionCoords) {
          lat = regionCoords[0];
          lng = regionCoords[1];
        } else {
          // Default to Ethiopia center if region not found
          lat = 9.145;
          lng = 40.4897;
        }
      }
      
      locationMap.set(locationKey, {
        id: locationKey,
        region,
        city,
        subcity,
        woreda,
        complaints: 0,
        closed: 0,
        coordinates: {
          lat,
          lng
        }
      });
    }
    
    const location = locationMap.get(locationKey);
    location.complaints += 1;
    
    if (complaint.status?.toLowerCase() === 'closed') {
      location.closed += 1;
    }
  });
  
  return Array.from(locationMap.values()).map(location => ({
    ...location,
    resolutionRate: location.complaints > 0 ? 
      Math.round((location.closed / location.complaints) * 100) : 0
  }));
};

/**
 * Get customer engagement data for charts
 */
const getCustomerEngagementData = (complaints) => {
  if (!complaints || complaints.length === 0) {
    return {
      reportsPerCustomer: [],
      customerActivityTimeline: [],
      customerLocationDistribution: []
    };
  }

  const customerReportCounts = new Map();
  const monthlyActivity = new Map();
  const customerLocations = new Map();
  const customerNames = new Map();

complaints.forEach(complaint => {
  const customerId = complaint.customer?.customer_id;
  const customerName = complaint.customer?.full_name;

  // Customer report counts
  if (customerId) {
    customerReportCounts.set(
      customerId,
      (customerReportCounts.get(customerId) || 0) + 1
    );

    // 👈 store name
    if (!customerNames.has(customerId)) {
      customerNames.set(customerId, customerName);
    }
  }

  // Monthly activity
  const date = new Date(complaint.created_at);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  monthlyActivity.set(monthKey, (monthlyActivity.get(monthKey) || 0) + 1);

  // Location distribution
  const region =
    complaint.region?.region_name ||
    complaint.city?.city_name ||
    'Unknown';

  if (customerId) {
    if (!customerLocations.has(customerId)) {
      customerLocations.set(customerId, new Set());
    }
    customerLocations.get(customerId).add(region);
  }
});


  // Transform data for charts
const reportsPerCustomer = Array.from(customerReportCounts.entries())
  .map(([customerId, count]) => ({
    customerId,
    customerName: customerNames.get(customerId),
    reportCount: count
  }))
  .sort((a, b) => b.reportCount - a.reportCount)
  .slice(0, 10);


  const customerActivityTimeline = Array.from(monthlyActivity.entries())
    .map(([month, count]) => ({
      month,
      reports: count,
      formattedMonth: month
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Customer location diversity
  const locationDiversity = Array.from(customerLocations.entries())
    .map(([customerId, locations]) => ({
      customerId,
      uniqueLocations: locations.size
    }));

  const avgLocationsPerCustomer = locationDiversity.length > 0 ?
    (locationDiversity.reduce((sum, item) => sum + item.uniqueLocations, 0) / locationDiversity.length).toFixed(1) : 0;

  return {
    reportsPerCustomer,
    customerActivityTimeline,
    customerLocationDistribution: locationDiversity,
    averageLocationsPerCustomer: parseFloat(avgLocationsPerCustomer)
  };
};

/**
 * Format query parameters for the complaints API
 */
const formatComplaintQueryParams = (filters) => {
  const params = {
    page: 1,
    limit: 1000
  };
  
  // Map frontend filters to backend parameters
  if (filters.status) params.status = filters.status;
  if (filters.region) params.region = filters.region;
  if (filters.zone) params.zone = filters.zone;
  if (filters.woreda) params.woreda = filters.woreda;
  if (filters.city) params.city = filters.city;
  if (filters.subcity) params.subcity = filters.subcity;
  if (filters.pollutionCategory) params.pollution_category_id = filters.pollutionCategory;
  if (filters.subPollutionCategory) params.subpollution_category_id = filters.subPollutionCategory;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  
  // Time range handling
  if (filters.timeRange && filters.timeRange !== 'all') {
    const days = parseInt(filters.timeRange);
    if (!isNaN(days)) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      params.start_date = startDate.toISOString().split('T')[0];
      params.end_date = endDate.toISOString().split('T')[0];
    }
  }
  
  return params;
};

/**
 * Fetch complaints data with customer information
 */
export const fetchComplaintsWithCustomers = async (filters = {}) => {
  try {
    const params = formatComplaintQueryParams(filters);
    const response = await api.get('/api/complaints', { params });
    
    if (response.data?.success) {
      return response.data.data || [];
    }
    
    console.warn('No complaint data found');
    return [];
  } catch (error) {
    console.error('Error fetching complaint data:', error);
    throw error;
  }
};

/**
 * Fetch all dashboard data including customer analytics
 */
export const fetchAllDashboardData = async (filters = {}) => {
  try {
    // Check cache first
    const cacheKey = JSON.stringify(filters);
    const now = Date.now();
    
    if (dashboardCache.lastFetchTime && 
        dashboardCache.cacheKey === cacheKey &&
        now - dashboardCache.lastFetchTime < dashboardCache.CACHE_DURATION) {
      return dashboardCache.data;
    }
    
    // Fetch fresh data
    const complaints = await fetchComplaintsWithCustomers(filters);
    
    if (!complaints || complaints.length === 0) {
      console.warn('No complaints found for selected filters');
      return getEmptyDashboardData(filters);
    }
    
    // Transform data in parallel
    const [
      stats, 
      pollutionTrend, 
      penaltyReasons, 
      customerReports, 
      subPollutionBreakdown, 
      locations,
      customerEngagement
    ] = await Promise.all([
      transformComplaintsToStats(complaints),
      transformComplaintsToTrendData(complaints),
      transformComplaintsToPenaltyData(complaints),
      transformComplaintsToRegionData(complaints),
      transformComplaintsToSubPollutionData(complaints),
      transformComplaintsToLocationData(complaints),
      getCustomerEngagementData(complaints)
    ]);
    
    const result = {
      stats: {
        total: stats.total,
        closed: stats.closed,
        inProgress: stats.inProgress,
        pending: stats.pending,
        rejected: stats.rejected,
        resolutionRate: stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0,
        averageResolutionTime: '7.5 days',
        topPollutionCategory: stats.pollutionStats[0]?.category || 'N/A',
        topRegion: stats.regionStats[0]?.region || 'N/A'
      },
      customerStats: stats.customerStats,
      charts: {
        pollutionTrend,
        penaltyReasons,
        customerReports,
        subPollutionBreakdown,
        customerEngagement: {
          reportsPerCustomer: customerEngagement.reportsPerCustomer,
          customerActivityTimeline: customerEngagement.customerActivityTimeline
        }
      },
      locations,
      customerEngagement,
      filters,
      metadata: {
        totalComplaints: stats.total,
        totalCustomers: stats.customerStats.totalCustomers,
        timeRange: filters.timeRange || '30d',
        lastUpdated: new Date().toISOString(),
        dataPoints: complaints.length
      }
    };


    console.log(result , "resssssssssult")
    
    // Cache the result
    dashboardCache.data = result;
    dashboardCache.cacheKey = cacheKey;
    dashboardCache.lastFetchTime = now;
    
    return result;
  } catch (error) {
    console.error('Error in fetchAllDashboardData:', error);
    return getEmptyDashboardData(filters, error.message);
  }
};

/**
 * Get empty dashboard data structure
 */
const getEmptyDashboardData = (filters, error = null) => {
  return {
    stats: {
      total: 0,
      closed: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0,
      resolutionRate: 0,
      averageResolutionTime: 'N/A',
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
    customerEngagement: {
      reportsPerCustomer: [],
      customerActivityTimeline: [],
      customerLocationDistribution: [],
      averageLocationsPerCustomer: 0
    },
    filters,
    metadata: {
      totalComplaints: 0,
      totalCustomers: 0,
      timeRange: filters.timeRange || '30d',
      lastUpdated: new Date().toISOString(),
      dataPoints: 0
    },
    error
  };
};

/**
 * Export dashboard data with customer analytics
 */
export const exportDashboardData = async (filters = {}) => {
  try {
    const data = await fetchAllDashboardData(filters);
    
    // Create CSV content
    const csvRows = [];
    
    // Add headers
    csvRows.push(['Pollution Complaint Dashboard Export', new Date().toLocaleDateString()]);
    csvRows.push([]);
    
    // Add basic statistics
    csvRows.push(['Basic Statistics']);
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Total Complaints', data.stats.total]);
    csvRows.push(['Resolved', data.stats.closed]);
    csvRows.push(['In Progress', data.stats.inProgress]);
    csvRows.push(['Pending', data.stats.pending]);
    csvRows.push(['Rejected', data.stats.rejected]);
    csvRows.push(['Resolution Rate', `${data.stats.resolutionRate}%`]);
    csvRows.push([]);
    
    // Add customer statistics
    csvRows.push(['Customer Statistics']);
    csvRows.push(['Total Customers', data.customerStats.totalCustomers]);
    csvRows.push(['Active Customers (Multiple Reports)', data.customerStats.activeCustomers]);
    csvRows.push(['Guest Customers', data.customerStats.guestCustomers]);
    csvRows.push(['Registered Customers', data.customerStats.registeredCustomers]);
    csvRows.push(['Customer Retention Rate', `${data.customerStats.customerRetentionRate}%`]);
    csvRows.push(['Average Reports per Customer', data.customerStats.averageReportsPerCustomer]);
    csvRows.push([]);
    
    // Add top reporting customers
    csvRows.push(['Top Reporting Customers']);
    csvRows.push(['Rank', 'Customer Name', 'Email', 'Phone', 'Total Reports', 'First Report', 'Last Report']);
    data.customerStats.topReportingCustomers.forEach((customer, index) => {
      csvRows.push([
        index + 1,
        customer.full_name,
        customer.email,
        customer.phone_number,
        customer.reportCount,
        customer.firstReportDate,
        customer.lastReportDate
      ]);
    });
    csvRows.push([]);
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

/**
 * Clear cache
 */
export const clearDashboardCache = () => {
  dashboardCache.data = null;
  dashboardCache.cacheKey = null;
  dashboardCache.lastFetchTime = null;
  dashboardCache.customerStats = null;
};

export default {
  fetchAllDashboardData,
  exportDashboardData,
  clearDashboardCache,
  fetchComplaintsWithCustomers,
  transformComplaintsToStats,
  transformComplaintsToTrendData,
  transformComplaintsToPenaltyData,
  transformComplaintsToRegionData,
  transformComplaintsToSubPollutionData,
  transformComplaintsToLocationData,
  getCustomerEngagementData
};