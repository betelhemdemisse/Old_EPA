const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationHierarchyController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: OrganizationHierarchy
 *   description: Organization hierarchy management
 */

/**
 * @swagger
 * /api/organization-hierarchy:
 *   post:
 *     summary: Create a new hierarchy level
 *     tags: [OrganizationHierarchy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hierarchy_name
 *             properties:
 *               hierarchy_name:
 *                 type: string
 *                 example: "Engineering Department"
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 example: "d54d71f9-0999-4cd4-bc17-50f81cb0c0f2"
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               city_id:
 *                 type: string
 *                 format: uuid
 *               subcity_id:
 *                 type: string
 *                 format: uuid
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *               woreda_id:
 *                 type: string
 *                 format: uuid
 *               isRegional:
 *                  type: boolean
 *                  example: true
 *                  description: Data for the new hierarchy level
 *     responses:
 *       201:
 *         description: Hierarchy created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", organizationController.createHierarchy);

/**
 * @swagger
 * /api/organization-hierarchy:
 *   get:
 *     summary: Get all hierarchy levels
 *     tags: [OrganizationHierarchy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all hierarchy data
 */
router.get("/", organizationController.getAllHierarchy);

/**
 * @swagger
 * /api/organization-hierarchy/{id}:
 *   get:
 *     summary: Get a single hierarchy by ID
 *     tags: [OrganizationHierarchy]
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
 *         description: Hierarchy found
 *       404:
 *         description: Hierarchy not found
 */
router.get("/:id", organizationController.getHierarchyById);

/**
 * @swagger
 * /api/organization-hierarchy/{id}:
 *   put:
 *     summary: Update hierarchy
 *     tags: [OrganizationHierarchy]
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
 *               hierarchy_name:
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               city_id:
 *                 type: string
 *                 format: uuid
 *               subcity_id:
 *                 type: string
 *                 format: uuid
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *               woreda_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Hierarchy updated successfully
 *       404:
 *         description: Hierarchy not found
 */
router.put("/:id", organizationController.updateHierarchy);

/**
 * @swagger
 * /api/organization-hierarchy/{id}:
 *   delete:
 *     summary: Delete hierarchy
 *     tags: [OrganizationHierarchy]
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
 *         description: Deleted successfully
 *       404:
 *         description: Hierarchy not found
 */
router.delete("/:id", organizationController.deleteHierarchy);

module.exports = router;
