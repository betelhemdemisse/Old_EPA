// routes/zoneRoutes.js
const express = require("express");
const router = express.Router();
const {
  createZone,
  getAllZones,
  getZoneById,
  getZonesByRegionId,
  updateZone,
  deleteZone,
} = require("../controllers/zone.controller"); 

const { verifyToken } = require("../middleware/authMiddleware");

// Apply authentication to all routes

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: API endpoints for managing zones
 */
/**
 * @swagger
 * /api/zones/region/{id}:
 *   get:
 *     summary: Get zones by region ID (with fallback to subcities if no zones)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Zones or subcities in the region/city
 *       400:
 *         description: No data found
 */
router.get("/region/:id", getZonesByRegionId);


router.use(verifyToken);
/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all zones
 */
router.get("/", getAllZones);
/**
 * @swagger
 * /api/zones/{id}:
 *   get:
 *     summary: Get zone by ID
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Zone details
 *       404:
 *         description: Zone not found
 */
router.get("/:id", getZoneById);


/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Create a new zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zone_name
 *               - region_id
 *             properties:
 *               name:
 *                 type: string
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Zone created
 *       400:
 *         description: Validation error
 */
router.post("/", createZone);

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Update a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zone_name:
 *                 type: string
 *               regionId:
 *                 type: string
 *                 description: Use "regionId" in body (matches your controller)
 *     responses:
 *       200:
 *         description: Zone updated
 *       404:
 *         description: Zone not found
 */
router.put("/:id", updateZone);

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Delete a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Zone deleted
 *       404:
 *         description: Zone not found
 */
router.delete("/:id", deleteZone);

module.exports = router;