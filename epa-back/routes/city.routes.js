
const express = require("express");
const router = express.Router();

const {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
} = require("../controllers/city.controller");

const { verifyToken } = require("../middleware/authMiddleware");


/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: API endpoints for managing cities (independent of regions)
 */

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all cities
 */
router.get("/", getAllCities);
router.use(verifyToken);

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Cities]
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
 *         description: City details
 *       404:
 *         description: City not found
 */
router.get("/:id", getCityById);

/**
 * @swagger
 * /api/cities:
 *   post:
 *     summary: Create a new city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city_name
 *             properties:
 *               city_name:
 *                 type: string
 *                 example: "Addis Ababa"
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: City created successfully
 *       400:
 *         description: city_name is required or already exists
 */
router.post("/", createCity);

/**
 * @swagger
 * /api/cities/{id}:
 *   put:
 *     summary: Update a city
 *     tags: [Cities]
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
 *               city_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: City updated successfully
 *       404:
 *         description: City not found
 */
router.put("/:id", updateCity);

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     summary: Delete a city
 *     tags: [Cities]
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
 *         description: City deleted successfully
 *       404:
 *         description: City not found
 */
router.delete("/:id", deleteCity);

module.exports = router;