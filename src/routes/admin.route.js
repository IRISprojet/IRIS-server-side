const express = require("express");
const uploadCloudinary = require('../middleware/cloudinary.middleware');
const {
  changeIsBanned,
  addStaff,
  deleteStaff,
  forgetPassword,
  getAllStaff,
  getStaffById,
  loginAdmin,
  registerAdmin,
  resetPassword,
  updateStaff,
  getAllUsers,
} = require("../controllers/admin.controller");

const router = express.Router();
// import middleware
const { isAuth, isAdmin } = require("../middleware");

// import controller register

//routes

//register a staff
router.post("/register", isAuth, isAdmin , registerAdmin);

//login a admin
router.post("/login", loginAdmin);

//forget-password
router.put("/forget-password", forgetPassword);

//reset-password
router.put("/reset-password", resetPassword);

//add a staff
router.post("/add", isAuth, isAdmin, addStaff);

//get all staff
router.get("/", isAuth, isAdmin, getAllStaff);

//get all users
router.get("/users", isAuth, isAdmin, getAllUsers);

//get a staff
router.get("/:id", isAuth, isAdmin, getStaffById);

//update a staff
router.put("/:id", uploadCloudinary.single('profilePicture'), isAuth, isAdmin, updateStaff);

//delete a staff
router.delete("/:id", isAuth, isAdmin, deleteStaff);

router.put("/ban/:id", isAuth, isAdmin, changeIsBanned);





module.exports = router;
