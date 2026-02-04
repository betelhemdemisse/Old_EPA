const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { updateFeedback,submitFeedback, getFeedbackByCase } = require('../controllers/feedbackController');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Feedback
 *     description: Feedback management endpoints
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback for a case
 *     description: Submits feedback for a case with status 'investigation_submitted'. Sends email notification to the assigned expert.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - comment
 *             properties:
 *               case_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               comment:
 *                 type: string
 *                 example: "Investigation completed successfully"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
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
 *                   example: "Feedback submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request (invalid case status or missing fields)
 *       404:
 *         description: Case not found
 *       500:
 *         description: Internal server error
 */
router.post('/', submitFeedback);

/**
 * @swagger
 * /api/feedback/case/{case_id}:
 *   get:
 *     summary: Get all feedback for a specific case
 *     description: Retrieves all feedback entries for a given case, ordered by creation date.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: case_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the case to retrieve feedback for
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
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
 *                       feedback_id:
 *                         type: string
 *                         format: uuid
 *                       case_id:
 *                         type: string
 *                         format: uuid
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       stamp_date:
 *                         type: string
 *                         format: date-time
 *                       comment:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 */

router.put('/:feedback_id', updateFeedback);

router.get('/:case_id/case', getFeedbackByCase);

module.exports = router;

