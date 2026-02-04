const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const teamCaseController = require("../controllers/TeamCaseController");

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   - name: Teamscases
 *     description: API endpoints for managing team formation for cases
 */

/**
 * @swagger
 * /api/teams-cases/create:
 *   post:
 *     summary: Create a new case and assign a team
 *     tags: [Teamscases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - complaint_id
 *               - users
 *               - investigation_days
 *             properties:
 *               complaint_id:
 *                 type: string
 *                 description: ID of the verified complaint the case is created for.
 *               users:
 *                 type: array
 *                 description: List of user IDs to assign to the team.
 *                 items:
 *                   type: string
 *               formed_by:
 *                 type: string
 *                 description: Overrides the creator. Defaults to token user.
 *               investigation_days:
 *                 type: integer
 *                 description: Number of days allocated for investigation.
 *     responses:
 *       201:
 *         description: Team created successfully
 *       400:
 *         description: Validation or business rule failure
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Case or complaint not found
 *       500:
 *         description: Internal server error
 */

router.post("/create", teamCaseController.createTeam);

/**
 * @swagger
 * /api/teams-cases/team/add-user:
 *   post:
 *     summary: Add user(s) to an existing team
 *     tags: [Teamscases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - users
 *             properties:
 *               case_id:
 *                 type: string
 *                 example: "9a1e54c3-2d8a-481e-a51b-d8e91e0ac3b1"
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "70a04bb1-063a-4a83-8d67-32c6b6dc8d0f"
 *                   - "1b887963-82b4-4ae8-a089-901b72c2e25a"
 *     responses:
 *       201:
 *         description: Users successfully added to the team
 *       400:
 *         description: Invalid input or users already in the team
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.post("/team/add-user", teamCaseController.addUserToTeam);

/**
 * @swagger
 * /api/teams-cases/team/remove-user:
 *   delete:
 *     summary: Remove one or multiple users from a team
 *     tags: [Teamscases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_id
 *               - users
 *             properties:
 *               case_id:
 *                 type: string
 *                 example: "9a1e54c3-2d8a-481e-a51b-d8e91e0ac3b1"
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "70a04bb1-063a-4a83-8d67-32c6b6dc8d0f"
 *                   - "1b887963-82b4-4ae8-a089-901b72c2e25a"
 *     responses:
 *       200:
 *         description: Users removed from the team successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: One or more users were not found in the team
 *       500:
 *         description: Internal server error
 */

router.delete("/team/remove-user", teamCaseController.removeUserFromTeam);
/**
 * @swagger
 * /api/teams-cases/team/{case_id}:
 *   get:
 *     summary: Get team members assigned to a specific case
 *     description: Returns all users assigned to the case via the TeamCase table.
 *     tags: [Teamscases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: case_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the case
 *     responses:
 *       200:
 *         description: Team members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Team members fetched successfully
 *                 team:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_case_id:
 *                         type: integer
 *                         example: 12
 *                       case_id:
 *                         type: string
 *                         format: uuid
 *                         example: "5b6f4b5c-3cbb-4e81-b7f7-123abc456def"
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                         example: "9b6f4b5c-3cbb-4e81-b7f7-123abc456def"
 *                       user:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: string
 *                             format: uuid
 *                             example: "9b6f4b5c-3cbb-4e81-b7f7-123abc456def"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *       400:
 *         description: case_id is required
 *       404:
 *         description: No team found for this case
 *       500:
 *         description: Server error
 */

router.get("/team/:case_id", teamCaseController.getTeamMembers);

module.exports = router;
