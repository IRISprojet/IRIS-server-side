const express = require("express");
const router = express.Router();
// import middleware
const { isAdmin } = require("../middleware");
// import controller register
const {
  addCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  getAllCategory,
  updateCourseProgress,
  getCoursebylevel,
  getCoursebycreator
} = require("../controllers/Internship.controller");

//Courses
router.post("/", addCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.get("/", getAllCourses);
router.get("/type/:type", getCoursebylevel);
router.get("/creator/:cretor", getCoursebycreator);
router.get("/category", getAllCategory);
router.get("/:id", getCourse);

router.put("/progress/:id", updateCourseProgress);

module.exports = router;
