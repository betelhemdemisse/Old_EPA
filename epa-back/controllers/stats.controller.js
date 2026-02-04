const db = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// Get general dashboard stats
const getGeneralDashboardStats = async (req, res) => {
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

    // Get status counts
    const statusStats = await db.Complaint.findAll({
      where: whereClause,
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('complaint_id')), 'count']
      ],
      group: ['status']
    });

    // Get total complaints
    const totalComplaints = await db.Complaint.count({ where: whereClause });

    // Get complaints by region
    const regionStats = await db.Complaint.findAll({
      where: whereClause,
      include: [{ model: db.Region, as: 'region' }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('Complaint.complaint_id')), 'count']
      ],
      include: [{ model: db.Region, as: 'region', attributes: ['region_name'] }],
      group: ['region.region_id', 'region.region_name']
    });

    // Get complaints by pollution category
    const pollutionStats = await db.Complaint.findAll({
      where: whereClause,
      include: [{ model: db.PollutionCategory, as: 'pollution_category' }],
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('Complaint.complaint_id')), 'count']
      ],
      include: [{ model: db.PollutionCategory, as: 'pollution_category', attributes: ['category_name'] }],
      group: ['pollution_category.pollution_category_id', 'pollution_category.category_name']
    });

    res.json({
      success: true,
      data: {
        totalComplaints,
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count)
        })),
        regionStats: regionStats.map(stat => ({
          region: stat.region.region_name,
          count: parseInt(stat.dataValues.count)
        })),
        pollutionStats: pollutionStats.map(stat => ({
          category: stat.pollution_category.category_name,
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

module.exports = {
  getGeneralDashboardStats
};
