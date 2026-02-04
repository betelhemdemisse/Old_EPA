// routes/complaintWorkFlow.routes.js
const express = require("express");
const router = express.Router();
const { getComplaintForTaskForce,closeComplaint,rejectComplaint,authorizeComplaint,getExpertsByWoredaHierarchyId, getAllComplaintForDuptyDirector,getPendingComplaintsCount,verifyAndChooseHandlingUnit,getExpertsByZoneHierarchyId,getExpertsByHierarchyId,getDetailAssignedCase,verifyComplaint, acceptSuggestionStatus, getAssignedComplaintForTaskForce,updateComplaintDetails,returnComplaint} = require("../controllers/complaintWorkFlow.controller");
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
/**
 * @swagger
 * tags:
 *   name: Complaints Workflow
 *   description: Complaint management endpoints
 */

/**
 * @swagger
 * /api/complaint-workflow/{complaint_id}/verify:
 *   patch:
 *     summary: Verify a complaint
 *     description: Verifies a complaint and optionally creates a case if team formation is not suggested.
 *     tags: [Complaints Workflow]
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the complaint to verify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_Team_Formation_needed:
 *                 type: boolean
 *                 description: Indicates whether team formation is suggested
 *               investigation_days:
 *                 type: integer
 *                 description: Remaining days for case processing if created
 *             required:
 *               - is_Team_Formation_needed
 *               - investigation_dayss
 *     responses:
 *       200:
 *         description: Complaint verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Complaint verified successfully
 *       404:
 *         description: Complaint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Complaint not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error message
 */
router.patch("/:complaint_id/verify", verifyComplaint);
/**
 * @swagger
 * /api/complaint-workflow/{complaint_id}/suggestion/accept:
 *   patch:
 *     summary: Accept team formation suggestion
 *     description: |
 *       Updates the Suggestion_status of a complaint to **Accepted**.
 *       This action is only allowed if:
 *       - The complaint status is **Verified**
 *       - `is_Team_Formation_needed` is **true**
 *
 *       Otherwise the request will be rejected.
 *     tags: [Complaints Workflow]
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Complaint ID for which suggestion status will be accepted
 *     responses:
 *       200:
 *         description: Suggestion status updated to Accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Suggestion status updated to Accepted successfully
 *       400:
 *         description: Validation error — conditions not met
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Suggestion cannot be accepted unless complaint is Verified
 *       404:
 *         description: Complaint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Complaint not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error message
 */
router.patch("/:complaint_id/suggestion/accept", acceptSuggestionStatus);

/**
 * @swagger
 * /api/complaint-workflow/{complaint_id}/update:
 *   patch:
 *     summary: Update complaint details before verification
 *     description: |
 *       Allows Taskforce/Main Directorate to edit complaint body 
 *       (location, pollution category, sub-category, description, etc.)
 *       **Only allowed when the complaint is NOT yet Verified.**
 *     tags: [Complaints Workflow]
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Complaint ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               pollution_category_id:
 *                 type: string
 *                 format: uuid
 *               subpollution_category_id:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       400:
 *         description: Complaint is already verified — cannot update
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:complaint_id/update", updateComplaintDetails);
/**
 * @swagger
 * /api/complaint-workflow/complaint_for_taskforce:
 *   get:
 *     summary: Get a pending complaint for taskforce expert
 *     description: |
 *       Retrieves the oldest pending complaint that has not been assigned yet and assigns it to the authenticated taskforce expert.
 *       Requires the permission `taskForce:can-get-complaint`.
 *     tags: [Complaints Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Complaint assigned successfully
 *                 complaint:
 *                   type: object
 *                   description: The assigned complaint details
 *                   properties:
 *                     complaint_id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     accepted_by:
 *                       type: string
 *                       format: uuid
 *                       example: "789e0123-e89b-12d3-a456-426614174999"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission
 *       404:
 *         description: No pending complaints available to assign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No pending complaints available to assign
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred while assigning the complaint
 *                 error:
 *                   type: string
 *                   example: Error message
 */

router.get("/complaint_for_taskforce",getComplaintForTaskForce)
// routes/complaintWorkFlow.routes.js
/**
 * @swagger
 * /api/complaint-workflow/assigned_complaints:
 *   get:
 *     summary: Get all complaints assigned to the authenticated taskforce expert
 *     description: |
 *       Retrieves all complaints assigned to the logged-in taskforce expert.
 *       Supports pagination and filtering by complaint status.
 *       Requires the permission `taskForce:can-get-complaint`.
 *     tags: [Complaints Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (single or comma-separated list)
 *         example: Pending,Verified
 *     responses:
 *       200:
 *         description: Assigned complaints retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Assigned complaints retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       complaint_id:
 *                         type: string
 *                         format: uuid
 *                       status:
 *                         type: string
 *                         example: Pending
 *                       accepted_by:
 *                         type: string
 *                         format: uuid
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       403:
 *         description: User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission
 *       404:
 *         description: No complaints assigned to this expert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No complaints assigned to this expert
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred while fetching assigned complaints
 *                 error:
 *                   type: string
 *                   example: Error message
 */

router.get("/assigned_complaints", getAssignedComplaintForTaskForce);
/**
 * @swagger
 * /api/complaint-workflow/{complaint_id}:
 *   get:
 *     summary: Get detailed information for an assigned complaint
 *     tags: [Complaints Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the complaint to retrieve
 *
 *     responses:
 *       200:
 *         description: Complaint details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ComplaintDetail'
 *
 *       400:
 *         description: Missing complaint_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: complaint_id is required
 *
 *       404:
 *         description: Complaint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Complaint not found
 *
 *       500:
 *         description: Server error while fetching complaint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get('/:complaint_id',getDetailAssignedCase)
/**
 * @swagger
 * /api/complaint-workflow/{complaint_id}:
 *   put:
 *     summary: "Verify a complaint and choose handling unit"
 *     description: |
 *       This endpoint performs BOTH:
 *       - Assigning a handling unit (hq_expert, temporary_team, regional_team)
 *       - Verifying the complaint
 *       
 *       It also:
 *       - Creates a new case with investigation days
 *       - Logs activity
 *       - Sends real-time notification to the customer
 *       
 *       *Requires permission:* **taskForce:can-verify-complaint**
 *     tags:
 *       - Complaints Workflow
 *     operationId: verifyAndChooseHandlingUnit
 * 
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *         description: "ID of the complaint to process"
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - handling_unit
 *             properties:
 *               handling_unit:
 *                 type: string
 *                 enum:
 *                   - temporary_team
 *                   - regional_team
 *                   - hq_expert
 *                 description: "The handling unit to assign"
 * 
 *               investigation_days:
 *                 type: integer
 *                 example: 14
 *                 description: "Number of days for investigation (default = 14)"
 * 
 *               is_Team_Formation_needed:
 *                 type: boolean
 *                 example: true
 *                 description: "Indicates whether team formation is required"
 * 
 *     responses:
 *       200:
 *         description: "Complaint verified and handling unit assigned successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Complaint verified and handling unit assigned successfully"
 *                 complaint:
 *                   type: object
 *                   description: "Updated complaint information"
 *                 case:
 *                   type: object
 *                   description: "Created case details"
 * 
 *       400:
 *         description: "Bad request - missing or invalid parameters"
 * 
 *       403:
 *         description: "User does not have permission"
 * 
 *       404:
 *         description: "Complaint not found"
 * 
 *       500:
 *         description: "Internal server error"
 */
router.put('/:complaint_id', verifyAndChooseHandlingUnit)
router.get('/complaint/dupty_director', getAllComplaintForDuptyDirector);
router.patch("/:complaint_id/authorize", authorizeComplaint);

router.patch(
  "/:complaint_id/close",
  upload.array("files"),
  closeComplaint
);


router.patch("/:complaint_id/return", returnComplaint);
router.get("/taskforce/pending-count", getPendingComplaintsCount
);
router.patch('/:complaint_id/reject', 
  rejectComplaint
);
/**
 * 
 * @swagger
 * /api/complaint-workflow/expert/by_hierarchy_id/by_loggedIn_user:
 *   get:
 *     summary: Get experts by logged-in user's hierarchy
 *     description: |
 *       Returns a list of experts who:
 *       - Belong to the same organization hierarchy as the logged-in user
 *       - Have the permission `can-get-complaint` on the `expert` resource
 *       - Excludes the logged-in user from the result
 *     tags:
 *       - Complaint Workflow
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of experts with required permission in the same hierarchy
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                     example: "c9b8f2c4-3a61-4a32-bc90-0d3f8d2e1234"
 *                   full_name:
 *                     type: string
 *                     example: "Abel Tesfaye"
 *                   email:
 *                     type: string
 *                     example: "abel.tesfaye@example.com"
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – insufficient permissions
 *       404:
 *         description: User hierarchy not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User hierarchy not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.get("/expert/by_hierarchy_id/by_loggedIn_user", getExpertsByHierarchyId)
router.get("/expert/by_hierarchy_id/by_loggedIn_zone_user", getExpertsByZoneHierarchyId)
router.get("/expert/by_hierarchy_id/by_loggedIn_woreda_user", getExpertsByWoredaHierarchyId)
module.exports = router;
