const express = require("express");
const router = express.Router();
const reportSubmissionController = require("../controllers/reportSubmission.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/closing_attachment/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

router.use(verifyToken);

const upload = multer({ storage });
// Apply auth middleware to all routes

/**
 * @swagger
 * tags:
 *   name: Report Submissions
 *   description: APIs for submitting and retrieving reports
 */

/**
 * @swagger
 * /api/report-submit/form/{report_type_id}:
 *   get:
 *     summary: Get a report form by report type
 *     tags: [Report Submissions]
 *     parameters:
 *       - in: path
 *         name: report_type_id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the report type
 *     responses:
 *       200:
 *         description: Report form retrieved successfully
 *       400:
 *         description: Missing or invalid report_type_id
 *       404:
 *         description: Report type not found
 *       500:
 *         description: Server error
 */
router.get("/form/:report_type_id", reportSubmissionController.getReportForm);

/**
 * @swagger
 * /api/report-submit:
 *   post:
 *     summary: Submit a report form
 *     tags: [Report Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_type_id
 *               - values
 *             properties:
 *               report_type_id:
 *                 type: string
 *                 description: UUID of the report type
 *               case_id:
 *                 type: string
 *                 description: UUID of the related case (optional)
 *               values:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - report_form_id
 *                     - value
 *                   properties:
 *                     report_form_id:
 *                       type: string
 *                       description: UUID of the form field
 *                     value:
 *                       type: string
 *                       description: Submitted value
 *     responses:
 *       200:
 *         description: Report submitted successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/", upload.array("files"),reportSubmissionController.submitReportForm);

/**
 * @swagger
 * /api/report-submit/submissions/result:
 *   get:
 *     summary: Get all report submissions
 *     tags: [Report Submissions]
 *     parameters:
 *       - in: query
 *         name: report_type_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter submissions by report type
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter submissions by case ID
 *     responses:
 *       200:
 *         description: List of report submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       case_id:
 *                         type: string
 *                       report_type_id:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       values:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             submission_id:
 *                               type: string
 *                             form_id:
 *                               type: string
 *                             value:
 *                               type: string
 *                             form:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 formType:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       reportType:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/submissions/result/:case_id", reportSubmissionController.getReportSubmissions);


module.exports = router;
