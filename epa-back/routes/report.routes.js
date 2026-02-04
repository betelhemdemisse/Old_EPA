const express = require('express');
const router = express.Router();
const reportController = require('../controllers/stats.controller');
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

// router.get('/dashboard-stats', reportController.getGeneralDashboardStats);
// router.get('/report-stats', reportController.getGeneralDashboardStats);

module.exports = router;