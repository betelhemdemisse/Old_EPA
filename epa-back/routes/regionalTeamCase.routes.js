
const express = require("express");
const router = express.Router();
const regionalTeamCaseController = require("../controllers/regionalTeamCase.controller");
const { verifyToken } = require("../middleware/authMiddleware");

// Protect all routes
router.use(verifyToken);

// Create regional team (main action for region admin)
router.post("/create", regionalTeamCaseController.createRegionalTeam);

// Optional: manage team members later
router.post("/add-members", regionalTeamCaseController.addUserToTeam);
router.post("/remove-members", regionalTeamCaseController.removeUserFromTeam);
router.get("/members/:case_id", regionalTeamCaseController.getTeamMembers);

module.exports = router;