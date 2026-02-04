// routes/subcityRoutes.js
const express = require("express");
const router = express.Router();

const {
  getSubcities,
  getSubcityById,
  createSubcity,
  getSubcitiesByCity,
  updateSubcity,
  deleteSubcity,
} = require("../controllers/subcity.controller"); 

const { verifyToken } = require("../middleware/authMiddleware");

// Apply authentication to all routes

/**
 * @swagger
 * tags:
 *   subcity_name: Subcities
 *   description: API endpoints for managing subcities
 */

/**
 * @swagger
 * /api/subcities:
 *   get:
 *     summary: Get all subcities
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subcities with city info
 */
router.use(verifyToken);
router.get("/", getSubcities);
router.use(verifyToken);

/**
 * @swagger
 * /api/subcities/{subcity_id}:
 *   get:
 *     summary: Get a subcity by ID
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subcity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subcity details
 *       404:
 *         description: Subcity not found
 */
router.get("/:subcity_id", getSubcityById);

/**
 * @swagger
 * /api/subcities/city/{city_id}:
 *   get:
 *     summary: Get all subcities in a city
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: city_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of subcities in the city
 *       404:
 *         description: City not found
 */
router.get("/city/:city_id", getSubcitiesByCity);

/**
 * @swagger
 * /api/subcities:
 *   post:
 *     summary: Create a new subcity
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city_id
 *             properties:
 *               subcity_name:
 *                 type: string
 *                 example: "Kirkos"
 *               city_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Subcity created successfully
 *       404:
 *         description: City not found
 */
router.post("/", createSubcity);

/**
 * @swagger
 * /api/subcities/{subcity_id}:
 *   put:
 *     summary: Update a subcity
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subcity_id
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
 *               subcity_name:
 *                 type: string
 *               city_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Subcity updated successfully
 *       404:
 *         description: Subcity or City not found
 */
router.put("/:subcity_id", updateSubcity);

/**
 * @swagger
 * /api/subcities/{subcity_id}:
 *   delete:
 *     summary: Delete a subcity
 *     tags: [Subcities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         subcity_name: subcity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subcity deleted successfully
 *       404:
 *         description: Subcity not found
 */
router.delete("/:subcity_id", deleteSubcity);

module.exports = router;