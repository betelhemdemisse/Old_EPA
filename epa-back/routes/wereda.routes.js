
const express = require("express");
const router = express.Router();

const {
  createWoreda,
  getAllWoredas,
  getWoredaById,
  getWoredasByZoneId,    // this handles both zone_id and subcity_id
  updateWoreda,
  deleteWoreda,
} = require("../controllers/wereda.controller"); 

const { verifyToken } = require("../middleware/authMiddleware");

// Apply authentication to all routes

/**
 * @swagger
 * tags:
 *   name: Woredas
 *   description: API for managing woredas (administrative divisions)
 */

/**
 * @swagger
 * /api/woredas/location/{value}:
 *   get:
 *     summary: Get woredas by zone_id OR subcity_id
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Either zone_id or subcity_id
 *     responses:
 *       200:
 *         description: List of matching woredas
 *       400:
 *         description: No woredas found
 */
router.get("/location/:value", getWoredasByZoneId);
router.use(verifyToken);

/**
 * @swagger
 * /api/woredas:
 *   get:
 *     summary: Get all woredas
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all woredas
 */
router.get("/", getAllWoredas);

/**
 * @swagger
 * /api/woredas/{id}:
 *   get:
 *     summary: Get a single woreda by ID
 *     tags: [Woredas]
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
 *         description: Woreda details
 *       404:
 *         description: Woreda not found
 */
router.get("/:id", getWoredaById);

/**
 * @swagger
 * /api/woredas:
 *   post:
 *     summary: Create a new woreda
 *     tags: [Woredas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - woreda_name
 *             properties:
 *               woreda_name:
 *                 type: string
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               subcity_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *             example:
 *               woreda_name: "Bole"
 *               zone_id: "zone-uuid-123"
 *     responses:
 *       201:
 *         description: Woreda created successfully
 *       400:
 *         description: Must provide exactly one of zone_id or subcity_id
 */
router.post("/", createWoreda);

/**
 * @swagger
 * /api/woredas/{id}:
 *   put:
 *     summary: Update a woreda
 *     tags: [Woredas]
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
 *               woreda_name:
 *                 type: string
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Woreda updated
 *       404:
 *         description: Woreda not found
 */
router.put("/:id", updateWoreda);

/**
 * @swagger
 * /api/woredas/{id}:
 *   delete:
 *     summary: Delete a woreda
 *     tags: [Woredas]
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
 *         description: Woreda deleted successfully
 *       404:
 *         description: Woreda not found
 */
router.delete("/:id", deleteWoreda);

module.exports = router;