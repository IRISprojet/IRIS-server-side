const CourseCategory = require("../models/stageCategory.model");
const User = require("../models/user.model");

// add courseCatgory
const addCourseCategory = async (req, res) => {
  try {
    const newCourseCategory = new CourseCategory({
      id: req.body.id,
      title: req.body.title,
      slug: req.body.slug,
      color: req.body.color,
    });
    newCourseCategory.save((err, savedCourseCategory) => {
      if (err) {
        
        res.status(500).send(err.message);
      } else {
        res.send(savedCourseCategory);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// get all courseCategories
const getAllCourseCategories = async (req, res) => {
  try {
    const courseCategories = await CourseCategory.find();
    res.send(courseCategories);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// get courseCategory by id
const getCourseCategory = async (req, res) => {
  try {
    const courseCategory = await CourseCategory.findById(req.params.id);
    res.send(courseCategory);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// update courseCategory
const updateCourseCategory = async (req, res) => {
  try {
    const courseCategory = await CourseCategory.findById(req.params.id);
    if (courseCategory) {
      courseCategory.id = req.body.id;
      courseCategory.title = req.body.title;
      courseCategory.slug = req.body.slug;
      courseCategory.color = req.body.color;
      const updatedCourseCategory = await courseCategory.save();
      res.send(updatedCourseCategory);
    } else {
      res.status(404).send("Course Category not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};
// delete courseCategory
const deleteCourseCategory = async (req, res) => {
  try {
    const courseCategory = await CourseCategory.findById(req.params.id);
    if (courseCategory) {
      await courseCategory.remove();
      res.send({ message: "Course Category removed" });
    } else {
      res.status(404).send("Course Category not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// change the category isPublished status
const changeCourseCategoryStatus = async (req, res) => {
  try {
    const courseCategory = await CourseCategory.findById(req.params.id);
    if (courseCategory) {
      courseCategory.status == "Show"
        ? (courseCategory.status = "Hide")
        : (courseCategory.status = "Show");
      const updatedCourseCategory = await courseCategory.save();
      res.send(updatedCourseCategory);
    } else {
      res.status(404).send("Course Category not found");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  addCourseCategory,
  getAllCourseCategories,
  getCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  changeCourseCategoryStatus,
};
