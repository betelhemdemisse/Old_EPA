const express = require("express");
const router = express.Router();
const reportTypeController = require("../controllers/reporttype.controller");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);
/**
 * @swagger
 * tags:
 *   name: ReportTypes
 *   description: CRUD operations for Report Types
 */

/**
 * @swagger
 * /api/report-type:
 *   post:
 *     summary: Create a new ReportType
 *     description: Requires the permission **reportType:create**
 *     tags: [ReportTypes]
 *     security:
 *       - bearerAuth: []   # If you are using JWT auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_type
 *             properties:
 *               report_type:
 *                 type: string
 *                 description: Name of the report type
 *               subpollution_category_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID of the related subpollution category (optional)
 *     responses:
 *       201:
 *         description: ReportType created successfully
 *       400:
 *         description: Missing required field
 *       403:
 *         description: User does not have permission to create ReportType
 *       500:
 *         description: Internal server error
 */
router.post("/", reportTypeController.createReportType);

/**
 * @swagger
 * /api/report-type:
 *   get:
 *     summary: Get all ReportTypes
 *     description: Requires the permission **reportType:read**
 *     tags: [ReportTypes]
 *     security:
 *       - bearerAuth: []  # Remove if you are not using JWT auth
 *     responses:
 *       200:
 *         description: List of ReportTypes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   report_type_id:
 *                     type: string
 *                     format: uuid
 *                   report_type:
 *                     type: string
 *                   subpollution_category_id:
 *                     type: string
 *                     format: uuid
 *                     nullable: true
 *                   created_by:
 *                     type: string
 *                     format: uuid
 *                   sub_pollution_category:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       subpollution_category_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *       403:
 *         description: User does not have permission to read ReportTypes
 *       500:
 *         description: Internal server error
 */

router.get("/", reportTypeController.getAllReportTypes);

/**
 * @swagger
 * /api/report-type/{id}:
 *   get:
 *     summary: Get a single ReportType by ID
 *     description: Requires the permission **reportType:read**
 *     tags: [ReportTypes]
 *     security:
 *       - bearerAuth: []   # Remove this if you are not using JWT
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the ReportType to retrieve
 *     responses:
 *       200:
 *         description: ReportType retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_type_id:
 *                   type: string
 *                   format: uuid
 *                 report_type:
 *                   type: string
 *                 subpollution_category_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 created_by:
 *                   type: string
 *                   format: uuid
 *                 sub_pollution_category:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     subpollution_category_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *       403:
 *         description: User does not have permission to read ReportType
 *       404:
 *         description: ReportType not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", reportTypeController.getReportTypeById);

/**
 * @swagger
 * /api/report-type/{id}:
 *   put:
 *     summary: Update a ReportType by ID
 *     tags: [ReportTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ReportType ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: ReportType updated successfully
 *       404:
 *         description: ReportType not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", reportTypeController.updateReportType);

/**
 * @swagger
 * /api/report-type/{id}:
 *   delete:
 *     summary: Delete a ReportType by ID
 *     tags: [ReportTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ReportType ID
 *     responses:
 *       200:
 *         description: ReportType deleted successfully
 *       404:
 *         description: ReportType not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", reportTypeController.deleteReportType);

module.exports = router;
