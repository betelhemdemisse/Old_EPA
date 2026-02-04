const express = require('express');
const router = express.Router();
const generalDashboardController = require('../controllers/generalDashboard.controller');

// Get filtered complaint data for dashboard
router.get('/', generalDashboardController.getFilteredComplaints);

// Get dashboard statistics
router.get('/stats', generalDashboardController.getDashboardStats);

// Get chart data for line chart
router.get('/chart-data', generalDashboardController.getChartData);

// Generate general report
router.get('/report', generalDashboardController.generateGeneralReport);

module.exports = router;
