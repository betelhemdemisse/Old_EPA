const express = require("express");
const router = express.Router();
const formTypeController = require("../controllers/formtype.controller");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);
/**
 * @swagger
 * tags:
 *   name: FormTypes
 *   description: CRUD operations for Form Types
 */

/**
 * @swagger
 * /api/form-type:
 *   post:
 *     summary: Create a new FormType
 *     tags: [FormTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - form_type
 *             properties:
 *               form_type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: FormType created successfully
 *       400:
 *         description: Missing required field
 *       500:
 *         description: Internal server error
 */
router.post("/", formTypeController.createFormType);

/**
 * @swagger
 * /api/form-type:
 *   get:
 *     summary: Get all FormTypes
 *     tags: [FormTypes]
 *     responses:
 *       200:
 *         description: List of FormTypes
 *       500:
 *         description: Internal server error
 */
router.get("/", formTypeController.getAllFormTypes);

/**
 * @swagger
 * /api/form-type/{id}:
 *   get:
 *     summary: Get a single FormType by ID
 *     tags: [FormTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FormType ID
 *     responses:
 *       200:
 *         description: FormType object
 *       404:
 *         description: FormType not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", formTypeController.getFormTypeById);

/**
 * @swagger
 * /api/form-type/{id}:
 *   put:
 *     summary: Update a FormType by ID
 *     tags: [FormTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FormType ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               form_type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: FormType updated successfully
 *       404:
 *         description: FormType not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", formTypeController.updateFormType);

/**
 * @swagger
 * /api/form-type/{id}:
 *   delete:
 *     summary: Delete a FormType by ID
 *     tags: [FormTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: FormType ID
 *     responses:
 *       200:
 *         description: FormType deleted successfully
 *       404:
 *         description: FormType not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", formTypeController.deleteFormType);

module.exports = router;
