const express = require("express");
const router = express.Router();
// import middleware
const { isAuth, isAdmin } = require("../middleware");
const {
  addClub,
  getAllClubs,
  getClub,
  updateClub,
  deleteClub,
} = require("../controllers/club.controller");

// Clubs
router.post("/", isAdmin, addClub);
router.get("/", getAllClubs);
router.get("/:id", getClub);
router.put("/:id", isAdmin, updateClub);
router.delete("/:id", isAdmin, deleteClub);

module.exports = router;

