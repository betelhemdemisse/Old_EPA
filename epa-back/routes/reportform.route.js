const express = require("express");
const router = express.Router();
const reportingFormController = require("../controllers/reportingForm.controller");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * All routes require authentication
 */
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: ReportingForms
 *   description: CRUD operations for Reporting Forms
 */

/**
 * @swagger
 * /api/reporting-form:
 *   post:
 *     summary: Create a new ReportingForm
 *     tags: [ReportingForms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_form
 *               - input_type
 *               - form_type_id
 *               - report_type_id
 *             properties:
 *               report_form:
 *                 type: string
 *               input_type:
 *                 type: string
 *                 enum: [text, number, textarea, select, checkbox, radio, date, file]
 *               options:
 *                 type: object
 *               required:
 *                 type: boolean
 *               form_type_id:
 *                 type: string
 *               report_type_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: ReportingForm created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", reportingFormController.createReportingForm);

/**
 * @swagger
 * /api/reporting-form:
 *   get:
 *     summary: Get all ReportingForms (optional filter by form_type_id and report_type_id)
 *     tags: [ReportingForms]
 *     parameters:
 *       - in: query
 *         name: form_type_id
 *         schema:
 *           type: string
 *         description: Filter by FormType ID
 *       - in: query
 *         name: report_type_id
 *         schema:
 *           type: string
 *         description: Filter by ReportType ID
 *     responses:
 *       200:
 *         description: List of ReportingForms
 *       500:
 *         description: Internal server error
 */
router.get("/", reportingFormController.getAllReportingForms);

/**
 * @swagger
 * /api/reporting-form/{id}:
 *   get:
 *     summary: Get a single ReportingForm by ID
 *     tags: [ReportingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ReportingForm ID
 *     responses:
 *       200:
 *         description: ReportingForm object
 *       404:
 *         description: ReportingForm not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", reportingFormController.getReportingFormById);

/**
 * @swagger
 * /api/reporting-form/{id}:
 *   put:
 *     summary: Update a ReportingForm by ID
 *     tags: [ReportingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ReportingForm ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report_form:
 *                 type: string
 *               input_type:
 *                 type: string
 *                 enum: [text, number, textarea, select, checkbox, radio, date, file]
 *               options:
 *                 type: object
 *               required:
 *                 type: boolean
 *               form_type_id:
 *                 type: string
 *               report_type_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: ReportingForm updated successfully
 *       404:
 *         description: ReportingForm not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", reportingFormController.updateReportingForm);

/**
 * @swagger
 * /api/reporting-form/{id}:
 *   delete:
 *     summary: Delete a ReportingForm by ID
 *     tags: [ReportingForms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ReportingForm ID
 *     responses:
 *       200:
 *         description: ReportingForm deleted successfully
 *       404:
 *         description: ReportingForm not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", reportingFormController.deleteReportingForm);

module.exports = router;
