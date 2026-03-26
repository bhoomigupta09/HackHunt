const express = require("express");
const router = express.Router();
const {
  createHackathon,
  deleteHackathon,
  getAdminHackathons,
  getHackathonById,
  getHackathons,
  getHackathonStats,
  getOrganizerHackathons,
  getUserRegistrations,
  registerForHackathon,
  unregisterFromHackathon,
  updateHackathon,
  updateHackathonApproval
} = require("../utils/controllers/hackathonController");

router.get("/", getHackathons);
router.get("/stats", getHackathonStats);
router.get("/admin/all", getAdminHackathons);
router.get("/organizer/:organizerId", getOrganizerHackathons);
router.get("/registrations/user/:userId", getUserRegistrations);
router.get("/:id", getHackathonById);

router.post("/", createHackathon);
router.post("/:id/register", registerForHackathon);

router.put("/:id", updateHackathon);
router.patch("/:id/approval", updateHackathonApproval);

router.delete("/:id", deleteHackathon);
router.delete("/registrations/:registrationId", unregisterFromHackathon);

module.exports = router;
