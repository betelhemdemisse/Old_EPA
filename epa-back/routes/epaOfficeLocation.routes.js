const express = require("express");
const router = express.Router();

const {
  createEpaOfficeLocation,
  getAllEpaOfficeLocations,
  getEpaOfficeLocation,
  updateEpaOfficeLocation,
  deleteEpaOfficeLocation,
} = require("../controllers/epaOfficeLocation.controller");


const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: EpaOfficeLocations
 *   description: API endpoints for managing EPA office locations
 */

/**
 * @swagger
 * /api/epa-office-locations:
 *   get:
 *     summary: Get all EPA office locations
 *     tags: [EpaOfficeLocations]
 *     responses:
 *       200:
 *         description: List of all office locations
 */
router.get("/", getAllEpaOfficeLocations);

/**
 * @swagger
 * /api/epa-office-locations/{id}:
 *   get:
 *     summary: Get an EPA office location by ID
 *     tags: [EpaOfficeLocations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: EpaOfficeLocation UUID
 *     responses:
 *       200:
 *         description: Office location data
 *       404:
 *         description: Office location not found
 */
router.get("/:id", verifyToken, getEpaOfficeLocation);

/**
 * @swagger
 * /api/epa-office-locations:
 *   post:
 *     summary: Create a new EPA office location
 *     tags: [EpaOfficeLocations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - name
 *             properties:
 *               latitude:
 *                 type: string
 *                 example: "9.0092"
 *               longitude:
 *                 type: string
 *                 example: "38.7626"
 *               name:
 *                 type: string
 *                 example: "EPA Headquarters"
 *               phone_number:
 *                 type: string
 *                 example: "+251911223344"
 *               email:
 *                 type: string
 *                 example: "info@epa.gov.et"
 *               description:
 *                 type: string
 *                 example: "Main EPA office"
 *     responses:
 *       201:
 *         description: EPA office location created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, createEpaOfficeLocation);

/**
 * @swagger
 * /api/epa-office-locations/{id}:
 *   put:
 *     summary: Update an EPA office location
 *     tags: [EpaOfficeLocations]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: EPA office location updated successfully
 *       404:
 *         description: EPA office location not found
 */
router.put("/:id", verifyToken, updateEpaOfficeLocation);

/**
 * @swagger
 * /api/epa-office-locations/{id}:
 *   delete:
 *     summary: Delete an EPA office location
 *     tags: [EpaOfficeLocations]
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
 *         description: Office location deleted successfully
 *       404:
 *         description: Office location not found
 */
router.delete("/:id", verifyToken, deleteEpaOfficeLocation);

module.exports = router;
