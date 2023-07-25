const express = require("express");
const router = express.Router();

// import controller
const {
  closeSession,
  verifySession,
  getAllSessions,
  closeAllSessions,
} = require("../controllers/device.controller");

router.get("", getAllSessions);
router.put("", verifySession);
router.delete("", closeSession);
router.delete("/all", closeAllSessions);

module.exports = router;
