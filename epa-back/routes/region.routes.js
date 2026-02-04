
const express = require("express");
const router = express.Router();

const {
  createRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} = require("../controllers/region.controller"); // <-- your controller file

const { verifyToken } = require("../middleware/authMiddleware");

// Apply authentication to all region routes

/**
 * @swagger
 * tags:
 *   region_name: Regions
 *   description: API endpoints for managing regions
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Get all regions
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all regions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Region'
 */
router.get("/", getAllRegions);
router.use(verifyToken);

/**
 * @swagger
 * /api/regions/{id}:
 *   get:
 *     summary: Get a region by ID
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         region_name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Region UUID
 *     responses:
 *       200:
 *         description: Region data
 *       404:
 *         description: Region not found
 */
router.get("/:id", getRegionById);

/**
 * @swagger
 * /api/regions:
 *   post:
 *     summary: Create a new region
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - region_name
 *             properties:
 *               region_name:
 *                 type: string
 *                 example: ""
 *               description:
 *                 type: string
 *                 nullable: true
 *             example:
 *               region_name: ""
 *               description: ""
 *     responses:
 *       201:
 *         description: Region created successfully
 *       400:
 *         description: Validation error or region_name already exists
 */
router.post("/", createRegion);

/**
 * @swagger
 * /api/regions/{id}:
 *   put:
 *     summary: Update a region
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         region_name: id
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
 *               region_name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Region updated successfully
 *       404:
 *         description: Region not found
 *       400:
 *         description: Validation error
 */
router.put("/:id", updateRegion);

/**
 * @swagger
 * /api/regions/{id}:
 *   delete:
 *     summary: Delete a region
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         region_name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Region deleted successfully
 *       404:
 *         description: Region not found
 */
router.delete("/:id", deleteRegion);

module.exports = router;