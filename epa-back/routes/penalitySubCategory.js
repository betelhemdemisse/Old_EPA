const express = require("express");
const router = express.Router();
const controller = require("../controllers/penalitySubCategory.controller");

/**
 * @swagger
 * tags:
 *   name: PenalitySubCategory
 *   description: Manage sub penalty categories
 */

/**
 * @swagger
 * /api/penality-sub-category:
 *   post:
 *     summary: Create a new penalty sub-category
 *     tags: [PenalitySubCategory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - penality_id
 *               - issue_type
 *             properties:
 *               penality_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent Penality Category
 *               issue_type:
 *                 type: string
 *                 description: Name or type of the sub-category
 *               description:
 *                 type: string
 *                 description: Optional description for the sub-category
 *     responses:
 *       201:
 *         description: Penalty sub-category created successfully
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
 *                   properties:
 *                     penality_sub_category_id:
 *                       type: string
 *                       format: uuid
 *                     penality_id:
 *                       type: string
 *                       format: uuid
 *                     issue_type:
 *                       type: string
 *                     description:
 *                       type: string
 *       404:
 *         description: Parent Penality Category not found
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
 *                   example: "Parent Penality Category not found"
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
 *                   example: "Server error"
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/penality-sub-category:
 *   get:
 *     summary: Get all penalty sub-categories
 *     tags: [PenalitySubCategory]
 *     responses:
 *       200:
 *         description: List of penalty sub-categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of sub-categories returned
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       penality_sub_category_id:
 *                         type: string
 *                         format: uuid
 *                       penality_id:
 *                         type: string
 *                         format: uuid
 *                       issue_type:
 *                         type: string
 *                       description:
 *                         type: string
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/penality-sub-category/{id}:
 *   get:
 *     summary: Get a penalty sub-category by ID
 *     tags: [PenalitySubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the sub-category
 *     responses:
 *       200:
 *         description: Sub-category found
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
 *                   properties:
 *                     penality_sub_category_id:
 *                       type: string
 *                       format: uuid
 *                     penality_id:
 *                       type: string
 *                       format: uuid
 *                     issue_type:
 *                       type: string
 *                     description:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         penalty_id:
 *                           type: string
 *                           format: uuid
 *                         penalty_name:
 *                           type: string
 *                         description:
 *                           type: string
 *       404:
 *         description: Sub Category not found
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/penality-sub-category/{id}:
 *   put:
 *     summary: Update a penalty sub-category
 *     tags: [PenalitySubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the sub-category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               penality_id:
 *                 type: string
 *                 format: uuid
 *               issue_type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sub-category updated successfully
 *       404:
 *         description: Sub-category or parent category not found
 *       500:
 *         description: Server error
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/penality-sub-category/{id}:
 *   delete:
 *     summary: Delete a penalty sub-category
 *     tags: [PenalitySubCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the sub-category
 *     responses:
 *       200:
 *         description: Sub-category deleted successfully
 *       404:
 *         description: Sub-category not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", controller.delete);

module.exports = router;
