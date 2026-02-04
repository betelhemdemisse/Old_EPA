const express = require("express");
const router = express.Router();
const controller = require("../controllers/complaintController");
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// Configure file upload (optional)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/complaint/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management endpoints
 */
/**
 * @swagger
 * /api/complaints/get_by_report_id/{report_id}:
 *   get:
 *     summary: Get complaint detail by report ID
 *     description: Fetch a complaint using its report_id, including all related models such as attachments, location info, customer info, and pollution categories.
 *     tags:
 *       - Complaints
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The report ID of the complaint
 *
 *     responses:
 *       200:
 *         description: Complaint fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Complaint object with all associations
 *                   properties:
 *                     complaint_id:
 *                       type: string
 *                       example: "c82f15d3-b0f1-4d9e-9ab1-d34b21e6e90d"
 *                     report_id:
 *                       type: string
 *                       example: "RPT-00123"
 *                     detail:
 *                       type: string
 *                       example: "Noise pollution reported from Megenagna area"
 *                     attachments:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         file_name:
 *                           type: string
 *                           example: "noise_evidence.jpg"
 *                         file_path:
 *                           type: string
 *                           example: "/uploads/noise_evidence.jpg"
 *
 *       400:
 *         description: Missing report_id parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "report_id is required"
 *
 *       404:
 *         description: Complaint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Complaint not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: false
 *                 message: "Failed to fetch complaint"
 *                 error: "Error message details"
 */
router.get("/get_by_report_id/:report_id", controller.getComplaintByReportId);
router.use(verifyToken);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     responses:
 *       200:
 *         description: Successfully fetched all complaints
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllComplaints);
/**
 * @swagger
 * /api/complaints/{complaint_id}:
 *   get:
 *     summary: Get complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint data returned successfully
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.get("/:complaint_id", controller.getComplaintById);

/**
 * @swagger
 * /api/complaints/get_by_customer_id/{customer_id}:
 *   get:
 *     summary: Get complaints by customer ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer to fetch complaints for
 *     responses:
 *       200:
 *         description: Complaints returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: customer_id is required
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.get("/get_by_customer_id/:customer_id", controller.getComplaintByCustomerId);


/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pollution_category_id
 *               - detail
 *             properties:
 *               city_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *
 *               region_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *
 *               subcity_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 * 
 *               is_guest:
 *                 type: boolean
 *                 example: true
 *                 nullable: false
 *
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *
 *               Woreda_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *
 *               pollution_category_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *
 *               subpollution_category_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *
 *               detail:
 *                 type: string
 *                 description: Detailed description of the complaint
 *
 *               specific_address:
 *                 type: string
 *                 description: Specific address or landmark
 *
 *               location_url:
 *                 type: string
 *                 description: Google Maps or location URL
 *
 *               status:
 *                 type: string
 *                 example: Pending
 *
 *               actDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the activity
 *
 *               actTime:
 *                 type: string
 *                 format: time
 *                 description: Time of the activity
 *
 *               file:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Server error
 */
router.post("/", upload.array("file", 10), controller.createComplaint);



/**
 * @swagger
 * /api/complaints/{complaint_id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaints]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the complaint to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               city_id:
 *                 type: string
 *                 format: uuid
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               subcity_id:
 *                 type: string
 *                 format: uuid
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *               woreda_id:
 *                 type: string
 *                 format: uuid
 *               location_url:
 *                 type: string
 *               detail:
 *                 type: string
 *               pollution_category_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               status:
 *                 type: string
 *               actDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the activity
 *               actTime:
 *                 type: string
 *                 format: time
 *                 description: Time of the activity
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.put("/:complaint_id", upload.single("file"), controller.updateComplaint);

/**
 * @swagger
 * /api/complaints/{complaint_id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         schema:
 *           type: uuid
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.delete("/:complaint_id", controller.deleteComplaint);

module.exports = router;
