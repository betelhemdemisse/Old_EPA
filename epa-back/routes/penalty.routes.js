const express = require("express");
const router = express.Router();
const controller = require("../controllers/penalty.controller");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Penalty
 *   description: Manage penalties
 */

/**
 * @swagger
 * /api/penalties:
 *   get:
 *     summary: Get all penalties
 *     tags: [Penalty]
 *     responses:
 *       200:
 *         description: List of penalties
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/penalties/{id}:
 *   get:
 *     summary: Get penalty by ID
 *     tags: [Penalty]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Penalty found
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/penalties:
 *   post:
 *     summary: Create a new penalty
 *     tags: [Penalty]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - penalty_name
 *             properties:
 *               penalty_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Penalty created successfully
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/penalties/{id}:
 *   put:
 *     summary: Update a penalty
 *     tags: [Penalty]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               penalty_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/penalties/{id}:
 *   delete:
 *     summary: Delete a penalty
 *     tags: [Penalty]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", controller.remove);

module.exports = router;
