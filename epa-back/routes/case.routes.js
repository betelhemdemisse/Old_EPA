const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getCaseForExpert,
  submitInvestigation,
  getchangeCaseInvestigationStatus,
  changeCaseInvestigationStatus, getAllComplaints,
  extendInvestigationDays,
  getDetailAssignedCase,
  reduceInvestigationDays,
  getAssignedCases,
  deleteAttachment,
  countCaseForExpert,
  assignExperts,
  getHQExperts,
  returnCase
} = require("../controllers/caseController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/case-attachement/");
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
 *   - name: Case
 *     description: Case management endpoints
 */
/**
 * @swagger
 * /api/case/expert:
 *   get:
 *     summary: Get the first verified complaint for expert (FIFO) and assign it
 *     description: Fetches the first complaint with status "Verified" that does not need team formation. Automatically assigns it to the expert and updates the complaint and case status.
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched and assigned complaint
 *       403:
 *         description: Expert does not have permission
 *       404:
 *         description: No verified complaints available
 *       500:
 *         description: Internal server error
 */
router.get("/expert", getCaseForExpert);
/**
 * @swagger
 * /api/case/expert_assigned_case:
 *   get:
 *     summary: Get cases assigned to an expert
 *     description: >
 *       Returns a paginated list of cases assigned to the currently authenticated expert.  
 *       Includes full complaint details, attachments, location hierarchy, customer info, and category info.
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved assigned expert cases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case_id:
 *                         type: integer
 *                         example: 14
 *                       remaining_days:
 *                         type: integer
 *                         example: 5
 *                       complaint:
 *                         type: object
 *                         description: Complaint details
 *                         properties:
 *                           complaint_id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           attachments:
 *                             type: array
 *                             items:
 *                               type: object
 *                           woreda:
 *                             type: object
 *                           zone:
 *                             type: object
 *                           subcity:
 *                             type: object
 *                           city:
 *                             type: object
 *                           region:
 *                             type: object
 *                           customer:
 *                             type: object
 *                           acceptedBy:
 *                             type: object
 *                           pollution_category:
 *                             type: object
 *                           sub_pollution_category:
 *                             type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized – No valid token provided
 *       403:
 *         description: Forbidden – User lacks permissions
 *       500:
 *         description: Internal server error
 */
router.get("/expert_assigned_case",getAssignedCases)
/**
 * @swagger
 * /api/case/change-case-investigation-status:
 *   post:
 *     summary: Change case investigation status
 *     description: Updates the status of a case investigation and logs the activity. Rejection reason is required if the status is a rejection.
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_investigation_id
 *               - status
 *             properties:
 *               case_investigation_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum:
 *                   - final
 *                   - approved_by_team_leader
 *                   - approved_by_department_head
 *                   - approved_by_dupty_director
 *                   - rejected_by_team_leader
 *                   - rejected_by_department_head
 *                   - rejected_by_director
 *               rejection_reason_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Missing rejection reason or invalid status
 *       403:
 *         description: No permission to update status
 *       404:
 *         description: Case investigation not found
 *       500:
 *         description: Server error
 */
router.post("/change-case-investigation-status", changeCaseInvestigationStatus);
/**
 * @swagger
 * /api/case/status/{case_id}/{case_attachement_id}:
 *   get:
 *     summary: Get investigation status of a case attachment
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: case_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: case_attachement_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *       404:
 *         description: Case attachment not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/status/:case_id/:case_attachement_id",
  getchangeCaseInvestigationStatus
);
router.get("/get/headquarter/experts",getHQExperts)
router.patch("/:case_id/return_case", returnCase);

// router.post("/force/assign-expert",assignExperts);

/**
 * @swagger
 * /api/case/expert/{case_id}/submit-investigation:
 *   post:
 *     summary: Expert submits daily or final investigation files
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: case_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               isFinal:
 *                 type: boolean
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Investigation submitted successfully
 *       400:
 *         description: Investigation already finalized
 *       404:
 *         description: Case not assigned to expert
 */

router.post(
  "/expert/:case_id/submit-investigation",
  verifyToken,
  upload.array("files"),
  submitInvestigation
);
/**
 * @swagger
 * /api/case:
 *   get:
 *     summary: Get all complaints
 *     tags: [Case]
 *     responses:
 *       200:
 *         description: Successfully fetched all complaints
 *       500:
 *         description: Server error
 */
router.get("/", getAllComplaints);
/**
 * @swagger
 * /api/case/extend-investigation:
 *   post:
 *     summary: Extend the investigation days for a case (only allowed after the original investigation period ends)
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               additional_days:
 *                 type: integer
 *                 example: 5
 *               reason:
 *                 type: string
 *                 example: "Need more time for field investigation"
 *             required:
 *               - case_id
 *               - additional_days
 *     responses:
 *       200:
 *         description: Investigation days extended successfully
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
 *                   example: "Investigation days extended successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Bad request (missing/invalid parameters or extension attempted before countdown ended)
 *       403:
 *         description: Unauthorized (user has no permission)
 *       500:
 *         description: Internal server error
 */
// router.post("/extend-investigation", extendInvestigationDays);
/**
 * @swagger
 * /api/case/{complaint_id}:
 *   get:
 *     summary: Get detailed information for an assigned case by complaint_id, including remaining days and reminder for expert
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaint_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the complaint to retrieve the assigned case for
 *     responses:
 *       200:
 *         description: Case details retrieved successfully
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
 *                   description: Detailed case information
 *                   properties:
 *                     case_id:
 *                       type: string
 *                       format: uuid
 *                     case_no:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     countdown_start_date:
 *                       type: string
 *                       format: date-time
 *                     countdown_end_date:
 *                       type: string
 *                       format: date-time
 *                     is_extended:
 *                       type: boolean
 *                     extended_days:
 *                       type: string
 *                     extended_by:
 *                       type: string
 *                       format: uuid
 *                     remaining_days:
 *                       type: object
 *                       properties:
 *                         daysLeft:
 *                           type: integer
 *                         hoursLeft:
 *                           type: integer
 *                     reminder:
 *                       type: boolean
 *                     complaint:
 *                       type: object
 *                       description: Complaint details
 *                       properties:
 *                         complaint_id:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                         attachments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ComplaintAttachement'
 *                         woreda:
 *                           $ref: '#/components/schemas/Woreda'
 *                         zone:
 *                           $ref: '#/components/schemas/Zone'
 *                         subcity:
 *                           $ref: '#/components/schemas/Subcity'
 *                         city:
 *                           $ref: '#/components/schemas/City'
 *                         region:
 *                           $ref: '#/components/schemas/Region'
 *                         customer:
 *                           $ref: '#/components/schemas/CustomerAccount'
 *                         acceptedBy:
 *                           $ref: '#/components/schemas/AdministratorAccounts'
 *                         pollution_category:
 *                           $ref: '#/components/schemas/PollutionCategory'
 *                         sub_pollution_category:
 *                           $ref: '#/components/schemas/SubPollutionCategory'
 *       400:
 *         description: Bad request (missing or invalid complaint_id)
 *       403:
 *         description: Unauthorized (user has no permission)
 *       404:
 *         description: Assigned case not found
 *       500:
 *         description: Internal server error
 */
router.get("/:complaint_id", getDetailAssignedCase);
/**
 * /api/case/case_attachment/{case_attachment_id}:
 *   delete:
 *     summary: Delete a case attachment
 *     description: Deletes a specific case attachment if the authenticated user is the creator.
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: case_attachment_id
 *         in: path
 *         required: true
 *         description: ID of the case attachment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
 *                   example: Attachment deleted successfully
 *       403:
 *         description: Forbidden - user does not have permission
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
 *                   example: You do not have permission to delete this attachment
 *       404:
 *         description: Attachment not found
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
 *                   example: Attachment not found
 *       500:
 *         description: Server error
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
 *                   example: Failed to delete attachment
 *                 error:
 *                   type: string
 *                   example: Database error message
 */
router.delete("/case_attachment/:case_attachment_id",deleteAttachment)
/**
 * @swagger
 * /api/case/reduce-investigation:
 *   post:
 *     summary: Reduce the investigation days for a case (only allowed after the original period ends)
 *     tags: [Case]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               case_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               reduction_days:
 *                 type: integer
 *                 example: 3
 *               reason:
 *                 type: string
 *                 example: "Investigation completed early"
 *             required:
 *               - case_id
 *               - reduction_days
 *     responses:
 *       200:
 *         description: Investigation days reduced successfully
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
 *                   example: "Investigation days reduced successfully"
 *       400:
 *         description: Bad request (missing or invalid parameters, or period not ended)
 *       403:
 *         description: Unauthorized (user has no permission)
 *       404:
 *         description: Case not found
 *       500:
 *         description: Internal server error
 */
// router.post("/reduce-investigation", reduceInvestigationDays);
router.get("/count/pending",countCaseForExpert)
module.exports = router;
