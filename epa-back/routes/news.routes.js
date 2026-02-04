const express = require("express");
const router = express.Router();
const controller = require("../controllers/newsController");
const multer = require("multer");
const { verifyToken } = require("../middleware/authMiddleware");

// ---------------------------
// Multer Storage Config
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/news/");
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
 *   name: News
 *   description: News content management
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: News list fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllNews);
router.use(verifyToken);
/**
 * @swagger
 * /api/news/{news_id}:
 *   get:
 *     summary: Get news by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: News fetched successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get("/:news_id", controller.getNews);

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create news
 *     tags: [News]
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
 *               news_description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: News created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("file"), controller.createNews);

/**
 * @swagger
 * /api/news/{news_id}:
 *   put:
 *     summary: Update news
 *     tags: [News]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               news_description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: News updated successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put("/:news_id", upload.single("file"), controller.updateNews);

/**
 * @swagger
 * /api/news/{news_id}:
 *   delete:
 *     summary: Delete news
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete("/:news_id", controller.deleteNews);

module.exports = router;
