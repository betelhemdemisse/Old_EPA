const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getAllRejectionReasons,
  getRejectionReasonById,
  createRejectionReason,
  updateRejectionReason,
  deleteRejectionReason,
} = require('../controllers/rejectionReasonController');

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: RejectionReason
 *   description: API endpoints for managing rejection reasons
 */

/**
 * @swagger
 * /api/rejection-reasons:
 *   get:
 *     summary: Get all rejection reasons
 *     tags: [RejectionReason]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rejection reasons
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
 *                     $ref: '#/components/schemas/RejectionReason'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllRejectionReasons);

/**
 * @swagger
 * /api/rejection-reasons/{id}:
 *   get:
 *     summary: Get a rejection reason by ID
 *     tags: [RejectionReason]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rejection reason ID
 *     responses:
 *       200:
 *         description: Rejection reason found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RejectionReason'
 *       404:
 *         description: Rejection reason not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getRejectionReasonById);

/**
 * @swagger
 * /api/rejection-reasons:
 *   post:
 *     summary: Create a new rejection reason
 *     tags: [RejectionReason]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason title
 *               description:
 *                 type: string
 *                 description: Optional description
 *     responses:
 *       201:
 *         description: Rejection reason created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', createRejectionReason);

/**
 * @swagger
 * /api/rejection-reasons/{id}:
 *   put:
 *     summary: Update a rejection reason
 *     tags: [RejectionReason]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rejection reason ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason title
 *               description:
 *                 type: string
 *                 description: Optional description
 *     responses:
 *       200:
 *         description: Rejection reason updated successfully
 *       404:
 *         description: Rejection reason not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateRejectionReason);

/**
 * @swagger
 * /api/rejection-reasons/{id}:
 *   delete:
 *     summary: Delete a rejection reason
 *     tags: [RejectionReason]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rejection reason ID
 *     responses:
 *       200:
 *         description: Rejection reason deleted successfully
 *       404:
 *         description: Rejection reason not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteRejectionReason);

module.exports = router;
