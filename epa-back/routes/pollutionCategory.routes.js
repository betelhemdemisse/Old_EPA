const express = require("express");
const router = express.Router();
const pollutionCategoryController = require("../controllers/pollutionCategory.controller");
const { verifyToken } = require("../middleware/authMiddleware");


/**
 * @swagger
 * tags:
 *   name: PollutionCategory
 *   description: Pollution Category management
 */

/**
 * @swagger
 * /api/pollution-categories:
 *   get:
 *     summary: Get all pollution categories
 *     tags: [PollutionCategory]
 *     responses:
 *       200:
 *         description: List of pollution categories
 */
router.get("/", pollutionCategoryController.getAll);
router.use(verifyToken);

/**
 * @swagger
 * /api/pollution-categories/{id}:
 *   get:
 *     summary: Get pollution category by ID
 *     tags: [PollutionCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pollution category found
 */
router.get("/:id", pollutionCategoryController.getById);

/**
 * @swagger
 * /api/pollution-categories:
 *   post:
 *     summary: Create a pollution category
 *     tags: [PollutionCategory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pollution_category
 *             properties:
 *               pollution_category:
 *                 type: string
 *                 example: Noise Pollution
 *               description:
 *                 type: string
 *                 example: Sound-related pollution
 *               is_sound:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Pollution category created
 */
router.post("/", pollutionCategoryController.create);

/**
 * @swagger
 * /api/pollution-categories/{id}:
 *   put:
 *     summary: Update pollution category
 *     tags: [PollutionCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pollution_category:
 *                 type: string
 *                 example: Noise Pollution
 *               description:
 *                 type: string
 *                 example: Updated description
 *               is_sound:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", pollutionCategoryController.update);

/**
 * @swagger
 * /api/pollution-categories/{id}:
 *   delete:
 *     summary: Delete pollution category
 *     tags: [PollutionCategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", pollutionCategoryController.remove);

module.exports = router;
