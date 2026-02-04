const express = require("express");
const router = express.Router();
const controller = require("../controllers/department.controller");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Manage departments
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Department]
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Department]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department found
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Department]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_name
 *             properties:
 *               department_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags: [Department]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags: [Department]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete("/:id", controller.remove);

module.exports = router;
