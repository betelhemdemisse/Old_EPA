const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizationMiddleware");
/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management endpoints
 */

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create a new permission
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_name
 *             properties:
 *               permission_name:
 *                 type: string
 *                 example: edit_users
 *               description:
 *                 type: string
 *                 example: Allows editing of user details
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Retrieve all permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   permission_id:
 *                     type: string
 *                     format: uuid
 *                     example: 02bcd389-5193-4baf-86ea-bb80e1a9b1b8
 *                   permission_name:
 *                     type: string
 *                     example: edit_users
 *                   description:
 *                     type: string
 *                     example: Allows editing of user details
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/permissions/{permission_id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Retrieve a specific permission by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permission_id:
 *                   type: string
 *                   format: uuid
 *                   example: 02bcd389-5193-4baf-86ea-bb80e1a9b1b8
 *                 permission_name:
 *                   type: string
 *                   example: edit_users
 *                 description:
 *                   type: string
 *                   example: Allows editing of user details
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/permissions/{permission_id}:
 *   put:
 *     tags: [Permissions]
 *     summary: Update a permission by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission_name:
 *                 type: string
 *                 example: manage_users
 *               description:
 *                 type: string
 *                 example: Updated description for permission
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/permissions/{permission_id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Delete a permission by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permission_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Permission ID
 *     responses:
 *       204:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
 */

router.use(verifyToken);
router.post("/", permissionController.createPermission);
router.get("/", permissionController.getAllPermissions);
router.get("/:permission_id", permissionController.getPermissionById);
router.put("/:permission_id", permissionController.updatePermission);
router.delete("/:permission_id", permissionController.deletePermission);

module.exports = router;
