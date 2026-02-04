const db = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const { Complaint, PollutionCategory ,SubPollutionCategory, sequelize} = require('../models');


// Get filtered complaint data for dashboard
const getFilteredComplaints = async (req, res) => { 
  try {
    const {
      status,
      regionId,
      zone,
      woreda,
      city,
      subcity,
      pollutionCategoryId,
      subPollutionCategory,
      reportId,
      penaltyCategory,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const whereClause = {};
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const offset = (pageNumber - 1) * pageSize;

    // Top-level filters
    if (status) whereClause.status = status;
    if (regionId) whereClause.region_id = regionId;
    if (zone) whereClause.zone_id = zone;
    if (woreda) whereClause.woreda_id = woreda;
    if (city) whereClause.city_id = city;
    if (subcity) whereClause.subcity_id = subcity;
    if (pollutionCategoryId) whereClause.pollution_category_id = pollutionCategoryId;
    if (subPollutionCategory) whereClause.subpollution_category_id = subPollutionCategory;
    if (reportId) whereClause.report_id = { [Op.iLike]: `%${reportId}%` };
console.log("penaltyCategory",penaltyCategory)
    // Date filters
    if (startDate && endDate) {
      whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      whereClause.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.created_at = { [Op.lte]: new Date(endDate) };
    }

    const include = [
      { model: db.Region, as: 'region' },
      { model: db.City, as: 'city' },
      { model: db.Subcity, as: 'subcity' },
      { model: db.Zone, as: 'zone' },
      { model: db.Woreda, as: 'woreda' },
      { model: db.PollutionCategory, as: 'pollution_category' },
      { model: db.SubPollutionCategory, as: 'sub_pollution_category' },
      { model: db.AdministratorAccounts, as: 'acceptedBy' },
      {
        model: db.Case,
        as: 'case',
        include: [
          {
            model: db.ReportSubmissions,
            as: 'reportSubmissions',
            include: [
              {
                model: db.PenalitySubCategory,
                as: 'penalitySubCategory',
                where: penaltyCategory ? { penality_sub_category_id: penaltyCategory } : undefined,
                required: !!penaltyCategory,
              },
            ],
          },
        ],
      },
    ];

    const complaints = await db.Complaint.findAndCountAll({
      where: whereClause,
      include,
      limit: pageSize,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true, // important to get correct count with nested joins
    });

    res.json({
      success: true,
      data: complaints.rows,
      pagination: {
        total: complaints.count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(complaints.count / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching filtered complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filtered complaints',
      error: error.message
    });
  }
};



// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const {
      status,
      region,
      zone,
      woreda,
      city,
      subcity,
      pollutionCategory,
      subPollutionCategory,
      penaltyCategory
    } = req.query;

    const whereClause = {};

    // Apply filters
    if (status) whereClause.status = status;
    if (region) whereClause.region_id = region;
    if (zone) whereClause.zone_id = zone;
    if (woreda) whereClause.woreda_id = woreda;
    if (city) whereClause.city_id = city;
    if (subcity) whereClause.subcity_id = subcity;
    if (pollutionCategory) whereClause.pollution_category_id = pollutionCategory;
    if (subPollutionCategory) whereClause.subpollution_category_id = subPollutionCategory;

    // Get total complaints
    const totalComplaints = await db.Complaint.count({ where: whereClause });
    
    const resolvedCount = await db.Complaint.count({
      where:{...whereClause , status:'Closed'}
    })
    const inProgressCount  = await db.Complaint.count({
      where:{...whereClause , status:'under_investigation'}
    })
     const rejectedCount  = await db.Complaint.count({
      where:{...whereClause , status:'Rejected'}
    })
    // Get status counts
    const statusStats = await db.Complaint.findAll({
      where: whereClause,
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('complaint_id')), 'count']
      ],
      group: ['status']
    });

    // Get complaints by region
    const regionStats = await db.Complaint.findAll({
      where: whereClause,
      include: [{ 
        model: db.Region, 
        as: 'region', 
        attributes: ['region_id', 'region_name'] 
      }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('complaint_id')), 'count']
      ],
      group: ['region.region_id', 'region.region_name']
    });

    // Get complaints by city
    const cityStats = await db.Complaint.findAll({
      where: whereClause,
      include: [{ 
        model: db.City, 
        as: 'city', 
        attributes: ['city_id', 'city_name'] 
      }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('complaint_id')), 'count']
      ],
      group: ['city.city_id', 'city.city_name']
    });

    // Get complaints by pollution category
    const pollutionStats = await db.Complaint.findAll({
      where: whereClause,
      include: [{ 
        model: db.PollutionCategory, 
        as: 'pollution_category', 
        attributes: ['pollution_category_id', 'pollution_category'] 
      }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('complaint_id')), 'count']
      ],
      group: ['pollution_category.pollution_category_id', 'pollution_category.pollution_category']
    });

    res.json({
      success: true,
      data: {
        totalComplaints,
        resolved:resolvedCount,
        in_progress:inProgressCount,
        rejected:rejectedCount,
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count)
        })),
        regionStats: regionStats.map(stat => ({
          region: stat.region ? stat.region.region_name : 'Unknown Region',
          count: parseInt(stat.dataValues.count)
        })),
        cityStats: cityStats.map(stat => ({
          city: stat.city ? stat.city.city_name : 'Unknown City',
          count: parseInt(stat.dataValues.count)
        })),
        pollutionStats: pollutionStats.map(stat => ({
          category: stat.pollution_category ? stat.pollution_category.pollution_category : 'Unknown Category',
          count: parseInt(stat.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

const getChartData = async (req, res) => {
  try {
    console.log('Full query object:', req.query);
    
    // Extract parameters from req.query
    const { 
      period = '30d',
      status, 
      region, 
      zone, 
      woreda, 
      city, 
      subcity, 
      pollutionCategory, 
      subPollutionCategory,
      penaltyCategory 
    } = req.query;

    console.log('Extracted period:', period);

    // Calculate start date from period
    const startDate = calculateStartDateFromPeriod(period);
    console.log('Calculated start date:', startDate);

    // Build where conditions
    const where = {
      created_at: {
        [Sequelize.Op.gte]: startDate
      }
    };

    // Helper function to add non-empty filters
    const addFilter = (field, value) => {
      if (value !== undefined && value !== null && value !== '') {
        where[field] = value;
      }
    };

    addFilter('status', status);
    addFilter('region_id', region);
    addFilter('zone_id', zone);
    addFilter('woreda_id', woreda);
    addFilter('city_id', city);
    addFilter('subcity_id', subcity);
    addFilter('pollution_category_id', pollutionCategory);
    addFilter('subpollution_category_id', subPollutionCategory);

    console.log('Final where clause for query:', JSON.stringify(where, null, 2));

    // Execute query with both main category and subcategory
    const results = await Complaint.findAll({
      attributes: [
        [sequelize.literal(`DATE("Complaint"."created_at")`), 'date'],
        [sequelize.literal(`COALESCE("pollution_category"."pollution_category", 'Unknown')`), 'category'],
        [sequelize.literal(`COALESCE("sub_pollution_category"."sub_pollution_category", 'No Subcategory')`), 'subcategory'],
        [sequelize.fn('COUNT', sequelize.col('Complaint.complaint_id')), 'count']
      ],
      include: [
        {
          model: PollutionCategory,
          as: 'pollution_category',
          attributes: [],
          required: false
        },
        {
          model: SubPollutionCategory, // Make sure this matches your model association name
          as: 'sub_pollution_category',
          attributes: [],
          required: false
        }
      ],
      where,
      group: [
        sequelize.literal(`DATE("Complaint"."created_at")`),
        sequelize.literal(`COALESCE("pollution_category"."pollution_category", 'Unknown')`),
        sequelize.literal(`COALESCE("sub_pollution_category"."sub_pollution_category", 'No Subcategory')`)
      ],
      order: [
        [sequelize.literal(`DATE("Complaint"."created_at")`), 'ASC'],
        [sequelize.literal(`COALESCE("pollution_category"."pollution_category", 'Unknown')`), 'ASC'],
        [sequelize.literal(`COALESCE("sub_pollution_category"."sub_pollution_category", 'No Subcategory')`), 'ASC']
      ],
      raw: true,
      subQuery: false
    });

    console.log('Query successful. Found', results.length, 'records');
    
    // Format the data for the frontend chart
    const formattedData = formatChartData(results);
    
    // Return response
    res.json({
      success: true,
      data: formattedData,
      rawData: results, // Keep raw data for debugging
      count: results.length,
      period: period,
      startDate: startDate
    });

  } catch (error) {
    console.error('Error in getChartData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
};

// Helper function to format chart data for the frontend
function formatChartData(results) {
  const dateMap = new Map();
  
  results.forEach(item => {
    const date = item.date;
    const category = item.category || 'Unknown';
    const subcategory = item.subcategory || 'No Subcategory';
    const count = parseInt(item.count);
    
    if (!dateMap.has(date)) {
      dateMap.set(date, { date });
    }
    
    const dateEntry = dateMap.get(date);
    
    // Create a unique key for the subcategory (category_subcategory)
    const key = `${category}_${subcategory}`.replace(/\s+/g, '_');
    dateEntry[key] = count;
    
    // Also store category info for reference
    dateEntry[`${key}_category`] = category;
    dateEntry[`${key}_subcategory`] = subcategory;
  });
  
  return Array.from(dateMap.values());
}

// Helper function to calculate start date from period
function calculateStartDateFromPeriod(period) {
  const now = new Date();
  const result = new Date(now);
  
  if (!period || period.trim() === '') {
    result.setDate(result.getDate() - 30);
    return result;
  }

  const match = period.match(/^(\d+)([dwm])$/);
  
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2];

    switch(unit.toLowerCase()) {
      case 'd':
        result.setDate(result.getDate() - amount);
        break;
      case 'w':
        result.setDate(result.getDate() - (amount * 7));
        break;
      case 'm':
        result.setMonth(result.getMonth() - amount);
        break;
      default:
        result.setDate(result.getDate() - 30);
    }
  } else {
    const days = parseInt(period);
    if (!isNaN(days)) {
      result.setDate(result.getDate() - days);
    } else {
      result.setDate(result.getDate() - 30);
    }
  }
  
  return result;
}

// Helper function to calculate start date from period
function calculateStartDateFromPeriod(period) {
  const now = new Date();
  const result = new Date(now);
  
  // Handle empty or invalid period
  if (!period || period.trim() === '') {
    result.setDate(result.getDate() - 30); // Default to 30 days
    return result;
  }

  // Parse period like "30d", "6m", "1y"
  const match = period.match(/^(\d+)([dwm])$/);
  
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2];

    switch(unit.toLowerCase()) {
      case 'd': // days
        result.setDate(result.getDate() - amount);
        break;
      case 'w': // weeks
        result.setDate(result.getDate() - (amount * 7));
        break;
      case 'm': // months
        result.setMonth(result.getMonth() - amount);
        break;
      default:
        result.setDate(result.getDate() - 30); // Default
    }
  } else {
    // If format doesn't match, try to parse as number of days
    const days = parseInt(period);
    if (!isNaN(days)) {
      result.setDate(result.getDate() - days);
    } else {
      // Default to 30 days
      result.setDate(result.getDate() - 30);
    }
  }
  
  return result;
}

// Helper function to calculate date from period string
function calculateDateFromPeriod(period) {
  const now = new Date();
  const result = new Date(now);
  
  if (!period) {
    // Default to 30 days
    result.setDate(result.getDate() - 30);
    return result;
  }

  const periodValue = parseInt(period);
  const periodUnit = period.toLowerCase().replace(periodValue.toString(), '');
  
  switch(periodUnit) {
    case 'd': // days
      result.setDate(result.getDate() - periodValue);
      break;
    case 'w': // weeks
      result.setDate(result.getDate() - (periodValue * 7));
      break;
    case 'm': // months
      result.setMonth(result.getMonth() - periodValue);
      break;
    case 'y': // years
      result.setFullYear(result.getFullYear() - periodValue);
      break;
    default:
      // Default to 30 days if invalid format
      result.setDate(result.getDate() - 30);
  }
  
  return result;
}

// Helper function to generate sample data if no real data exists
const generateSampleData = (startDate, period = '30d') => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
  const result = [];
  
  const categories = [
    { key: 'chemical_pollution', name: 'Chemical Pollution', color: '#10b981' },
    { key: 'air_pollution', name: 'Air Pollution', color: '#3b82f6' },
    { key: 'water_pollution', name: 'Water Pollution', color: '#06b6d4' },
    { key: 'waste_pollution', name: 'Waste Pollution', color: '#ef4444' },
    { key: 'noise_pollution', name: 'Noise Pollution', color: '#f59e0b' }
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const formattedDate = date.toISOString().split('T')[0];
    const dayData = { date: formattedDate };

    categories.forEach(category => {
      // Generate realistic data with some randomness and trend
      const baseValue = Math.floor(Math.random() * 15) + 5;
      const trend = Math.sin(i * 0.2) * 3;
      dayData[category.key] = Math.max(1, Math.floor(baseValue + trend));
    });

    result.push(dayData);
  }

  return result;
};

// Generate general report
const generateGeneralReport = async (req, res) => {
  try {
    const {
      status,
      region,
      zone,
      woreda,
      city,
      subcity,
      pollutionCategory,
      subPollutionCategory,
      penaltyCategory,
      startDate,
      endDate
    } = req.query;

    const whereClause = {};

    // Apply filters
    if (status) whereClause.status = status;
    if (region) whereClause.region_id = region;
    if (zone) whereClause.zone_id = zone;
    if (woreda) whereClause.woreda_id = woreda;
    if (city) whereClause.city_id = city;
    if (subcity) whereClause.subcity_id = subcity;
    if (pollutionCategory) whereClause.pollution_category_id = pollutionCategory;
    if (subPollutionCategory) whereClause.subpollution_category_id = subPollutionCategory;

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const complaints = await db.Complaint.findAll({
      where: whereClause,
      include: [
        { model: db.Region, as: 'region' },
        { model: db.City, as: 'city' },
        { model: db.Subcity, as: 'subcity' },
        { model: db.Zone, as: 'zone' },
        { model: db.Woreda, as: 'woreda' },
        { model: db.PollutionCategory, as: 'pollution_category' },
        { model: db.SubPollutionCategory, as: 'sub_pollution_category' },
        { model: db.AdministratorAccounts, as: 'acceptedBy' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Generate summary statistics
    const summary = {
      totalComplaints: complaints.length,
      statusBreakdown: {},
      regionBreakdown: {},
      pollutionBreakdown: {}
    };

    complaints.forEach(complaint => {
      // Status breakdown
      summary.statusBreakdown[complaint.status] = (summary.statusBreakdown[complaint.status] || 0) + 1;

      // Region breakdown
      if (complaint.region) {
        summary.regionBreakdown[complaint.region.region_name] = (summary.regionBreakdown[complaint.region.region_name] || 0) + 1;
      }

      // Pollution category breakdown
      if (complaint.pollution_category) {
        summary.pollutionBreakdown[complaint.pollution_category.pollution_category] = (summary.pollutionBreakdown[complaint.pollution_category.pollution_category] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        summary,
        complaints: complaints.map(c => ({
          id: c.complaint_id,
          reportId: c.report_id,
          status: c.status,
          region: c.region?.region_name,
          city: c.city?.city_name,
          pollutionCategory: c.pollution_category?.pollution_category,
          createdAt: c.created_at,
          detail: c.detail
        }))
      }
    });
  } catch (error) {
    console.error('Error generating general report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate general report',
      error: error.message
    });
  }
};

module.exports = {
  getFilteredComplaints,
  getDashboardStats,
  getChartData,
  generateGeneralReport
};
