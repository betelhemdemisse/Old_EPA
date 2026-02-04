const express = require("express");
const router = express.Router();

const {
  createSoundArea,
  getAllSoundAreas,
  getSoundArea,
  updateSoundArea,
  deleteSoundArea,
} = require("../controllers/soundArea.controller");

const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: SoundAreas
 *   description: API endpoints for managing sound areas
 */

/**
 * @swagger
 * /api/sound-areas:
 *   get:
 *     summary: Get all sound areas
 *     tags: [SoundAreas]
 *     responses:
 *       200:
 *         description: List of all sound areas
 */
router.get("/", getAllSoundAreas);

/**
 * @swagger
 * /api/sound-areas/{id}:
 *   get:
 *     summary: Get a sound area by ID
 *     tags: [SoundAreas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: SoundArea UUID
 *     responses:
 *       200:
 *         description: Sound area data
 *       404:
 *         description: Sound area not found
 */
router.get("/:id", verifyToken, getSoundArea);

/**
 * @swagger
 * /api/sound-areas:
 *   post:
 *     summary: Create a new sound area
 *     tags: [SoundAreas]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Hall"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Area near the entrance"
 *     responses:
 *       201:
 *         description: Sound area created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, createSoundArea);

/**
 * @swagger
 * /api/sound-areas/{id}:
 *   put:
 *     summary: Update a sound area
 *     tags: [SoundAreas]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Sound area updated successfully
 *       404:
 *         description: Sound area not found
 */
router.put("/:id", verifyToken, updateSoundArea);

/**
 * @swagger
 * /api/sound-areas/{id}:
 *   delete:
 *     summary: Delete a sound area
 *     tags: [SoundAreas]
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
 *         description: Sound area deleted successfully
 *       404:
 *         description: Sound area not found
 */
router.delete("/:id", verifyToken, deleteSoundArea);

module.exports = router;
