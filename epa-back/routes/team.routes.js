const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management endpoints
 */

// Create a new team
/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_id
 *               - category_id
 *               - team_name
 *             properties:
 *               department_id:
 *                 type: string
 *                 description: Department UUID
 *               category_id:
 *                 type: string
 *                 description: Pollution category UUID
 *               team_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", teamController.createTeam);

// Get all teams
/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams
 *       400:
 *         description: Bad request
 */
router.get("/", teamController.getAllTeams);

// Get a team by ID
/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team UUID
 *     responses:
 *       200:
 *         description: Team data
 *       404:
 *         description: Team not found
 */
router.get("/:id", teamController.getTeamById);

// Update a team
/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *               team_name:
 *                 type: string
 *               updated_by:
 *                 type: string
 *                 description: Administrator UUID
 *     responses:
 *       200:
 *         description: Team updated successfully
 *       404:
 *         description: Team not found
 *       400:
 *         description: Bad request
 */
router.put("/:id", teamController.updateTeam);

// Delete a team
/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team UUID
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       404:
 *         description: Team not found
 *       400:
 *         description: Bad request
 */
router.delete("/:id", teamController.deleteTeam);

module.exports = router;
