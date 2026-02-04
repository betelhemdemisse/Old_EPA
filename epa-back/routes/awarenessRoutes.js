const express = require("express");
const router = express.Router();
const controller = require("../controllers/awareness.controller");
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// ---------------------------
// Multer Storage Config
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/awareness/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Apply token verification to all routes


/**
 * @swagger
 * tags:
 *   name: Awareness
 *   description: Awareness content management
 */

/**
 * @swagger
 * /api/awareness:
 *   get:
 *     summary: Get all awareness items
 *     tags: [Awareness]
 *     responses:
 *       200:
 *         description: Awareness list fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllAwareness);
router.use(verifyToken);
/**
 * @swagger
 * /api/awareness/{awareness_id}:
 *   get:
 *     summary: Get awareness by ID
 *     tags: [Awareness]
 *     parameters:
 *       - in: path
 *         name: awareness_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Awareness fetched successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get("/:awareness_id", controller.getAwareness);

/**
 * @swagger
 * /api/awareness:
 *   post:
 *     summary: Create a new awareness content
 *     tags: [Awareness]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               awareness_description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Awareness created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("file"), controller.createAwareness);

/**
 * @swagger
 * /api/awareness/{awareness_id}:
 *   put:
 *     summary: Update awareness content
 *     tags: [Awareness]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: awareness_id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               awareness_description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Awareness updated successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put("/:awareness_id", upload.single("file"), controller.updateAwareness);

/**
 * @swagger
 * /api/awareness/{awareness_id}:
 *   delete:
 *     summary: Delete awareness content
 *     tags: [Awareness]
 *     parameters:
 *       - in: path
 *         name: awareness_id
 *         required: true
 *     responses:
 *       200:
 *         description: Awareness deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete("/:awareness_id", controller.deleteAwareness);

module.exports = router;
