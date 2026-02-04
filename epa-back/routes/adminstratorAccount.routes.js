const express = require("express"); 
const router = express.Router();
const adminController = require("../controllers/adminstratorAccountController");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  validateCreateAdministrator,
  validateUpdateAdministrator
} = require("../validators/administratorValidator");
 router.use(verifyToken);

// Uncomment if you want auth protection
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Administrators
 *   description: Administrator management endpoints
 */

/**
 * @swagger
 * /api/administrator:
 *   post:
 *     summary: Create a new administrator user
 *     tags: [Administrators]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of role UUIDs
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               sub_pollution_category_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of sub-pollution category UUIDs
 *               hierarchy_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of hierarchy UUIDs
 *     responses:
 *       201:
 *         description: Administrator user created successfully
 *       400:
 *         description: Bad request or validation error
 *       500:
 *         description: Internal server error
 */
router.post("/", adminController.createAdministratorUser);

/**
 * @swagger
 * /api/administrator:
 *   get:
 *     summary: Get all administrators
 *     tags: [Administrators]
 *     responses:
 *       200:
 *         description: List of administrators
 *       500:
 *         description: Internal server error
 */
router.get("/", adminController.getAllAdministrators);

/**
 * @swagger
 * /api/administrator/{id}:
 *   get:
 *     summary: Get administrator by ID
 *     tags: [Administrators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Administrator UUID
 *     responses:
 *       200:
 *         description: Administrator data
 *       404:
 *         description: Administrator not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", adminController.getAdministratorById);

/**
 * @swagger
 * /api/administrator/{id}:
 *   put:
 *     summary: Update an administrator
 *     tags: [Administrators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Administrator UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               sub_pollution_category_id:
 *                 type: array
 *                 items:
 *                   type: string
 *               hierarchy_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               updated_by:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Administrator updated successfully
 *       404:
 *         description: Administrator not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", adminController.updateAdministrator);

/**
 * @swagger
 * /api/administrator/{id}:
 *   delete:
 *     summary: Delete an administrator
 *     tags: [Administrators]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Administrator UUID
 *     responses:
 *       200:
 *         description: Administrator deleted successfully
 *       404:
 *         description: Administrator not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", adminController.deleteAdministrator);
 
router.get("/all_regional/user", adminController.getAllRegionalUser)

router.patch("/:user_id/activate", adminController.activateUserAccount);
router.patch("/:user_id/deactivate",adminController.deactivateUserAccount);
router.get("/get_all/user/experts",adminController.getAllUser)
module.exports = router;
