const express = require("express");
const router = express.Router();
const db = require("../models");
const roleController = require("../controllers/roleController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizationMiddleware");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API endpoints for managing roles
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role and optionally assigns permissions to it.
 *     tags: [Roles]
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
 *                 description: The name of the role to be created.
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of permission IDs to assign to the role.
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the role was created.
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The list of permissions assigned to the created role.
 *       400:
 *         description: Bad request. Missing required fields or invalid data.
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of all roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 status:
 *                   type: number
 *       404:
 *         description: Role not found
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         role_id:
 *           type: string
 *           description: Unique ID of the role
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               permission_id:
 *                 type: string
 *               name:
 *                 type: string
 */
router.use(verifyToken);
router.post("/",  roleController.createRole);
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);
module.exports = router;

