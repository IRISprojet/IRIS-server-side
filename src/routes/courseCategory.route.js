const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin } = require("../middleware");

const {
  addCourseCategory,
  getAllCourseCategories,
  getCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  changeCourseCategoryStatus,
} = require("../controllers/stageCategory.controller");

//Course Categories
router.post("/", isAdmin, addCourseCategory);
router.get("/", getAllCourseCategories);
router.get("/:id", getCourseCategory);
router.put("/:id", isAdmin, updateCourseCategory);
router.delete("/:id", isAdmin, deleteCourseCategory);
router.put("/status/:id", isAdmin, changeCourseCategoryStatus);

module.exports = router;
