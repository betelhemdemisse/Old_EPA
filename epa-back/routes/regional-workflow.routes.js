
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const {
  getComplaintForRegionAdmin,
  assignToHierarchy,
  getComplaintForZoneAdmin,
  assignToLowerHierarchy,
  getComplaintForWoredaAdmin,
  assignToWoredaExpert,
  getCaseForRegionalExpert,
  getAssignedRegionalCases,
  submitRegionalInvestigation,
  reviewRegionalInvestigation,
  deleteRegionalAttachment,
  openRegionalCase,
  countUnopenedRegionalCases,
} = require("../controllers/regionWorkFlow.controller");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/case-attachement/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Regional Workflow
 *     description: Regional complaint handling (Region → Zone → Woreda → Expert). Countdown starts only when assigned to expert.
 */

/**
 * @swagger
 * /api/regional-workflow/region/complaint/pull:
 *   get:
 *     summary: Region Admin pulls next complaint 
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Complaint pulled successfully }
 *       404: { description: No pending complaints }
 */
router.get("/region/complaint/pull", getComplaintForRegionAdmin);

/**
 * @swagger
 * /api/regional-workflow/region/assign:
 *   post:
 *     summary: Region Admin assigns to Zone or directly to Expert
 *     description: If assigned to expert → countdown starts. If to zone → just forwards.
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [complaint_id, organization_hierarchy_id, handling_unit]
 *             properties:
 *               complaint_id: { type: string }
 *               organization_hierarchy_id: { type: string }
 *               handling_unit: { type: string, enum: [expert, zone_admin] }
 *               expert_id: { type: string, nullable: true }
 *     responses:
 *       200: { description: Assigned successfully }
 */
router.post("/region/assign", assignToHierarchy);

/**
 * @swagger
 * /api/regional-workflow/zone/complaint/pull:
 *   get:
 *     summary: Zone Admin pulls next complaint 
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 */
router.get("/zone/complaint/pull", getComplaintForZoneAdmin);
router.post("/zone/assign", assignToLowerHierarchy);

/**
 * @swagger
 * /api/regional-workflow/woreda/complaint/pull:
 *   get:
 *     summary: Woreda Admin pulls next complaint 
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Success }
 */
router.get("/woreda/complaint/pull", getComplaintForWoredaAdmin);
router.post("/woreda/assign-expert", assignToWoredaExpert);

/**
 * @swagger
 * /api/regional-workflow/expert/case:
 *   get:
 *     summary: Regional Expert gets next assigned case (FIFO)
 *     description: Only cases with status containing "_expert" are returned. On first access → countdown starts + complaint status → under_investigation
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: complaint_id
 *         schema: { type: string }
 *     responses:
 *       200: { description: Case returned }
 *       404: { description: No assigned case }
 */
// router.get("/expert/case", getCaseForRegionalExpert);
// router.get("/expert/case/:complaint_id", getCaseForRegionalExpert);

/**
 * @swagger
 * /api/regional-workflow/expert/cases:
 *   get:
 *     summary: List all assigned cases for the expert
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of cases with remaining_days }
 */
router.get("/expert/cases", getAssignedRegionalCases);

router.get("/expert/case/open", openRegionalCase);

router.get("/expert/cases/unopened/count", countUnopenedRegionalCases);

/**
 * @swagger
 * /api/regional-workflow/expert/{case_id}/submit-investigation:
 *   post:
 *     summary: Expert submits investigation (interim or final)
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: case_id
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               isFinal: { type: boolean }
 *               files:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200: { description: Submitted. If isFinal=true → case becomes investigation_submitted }
 */
router.post(
  "/expert/:case_id/submit-investigation",
  upload.array("files", 12),
  submitRegionalInvestigation
);

/**
 * @swagger
 * /api/regional-workflow/region/investigation/review:
 *   post:
 *     summary: Region Admin approves/rejects investigation using case_id
 *     description: Uses case_id instead of case_investigation_id for consistency with reporting
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [case_id, status]
 *             properties:
 *               case_id: { type: string, format: uuid }
 *               status:
 *                 type: string
 *                 enum: [approved_by_region_admin, rejected_by_region_admin]
 *               rejection_reason_id: { type: string, nullable: true }
 *     responses:
 *       200: { description: Investigation reviewed }
 */
router.post("/region/investigation/review", reviewRegionalInvestigation);

/**
 * @swagger
 * /api/regional-workflow/case_attachment/{case_attachment_id}:
 *   delete:
 *     summary: Delete own attachment
 *     tags: [Regional Workflow]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: case_attachment_id
 *         in: path
 *         required: true
 *     responses:
 *       200: { description: Deleted }
 */
router.delete("/case_attachment/:case_attachment_id", deleteRegionalAttachment);

module.exports = router;