const socket = require("../../socket");
const Course = require("../models/internship.model");
const notificationModel = require("../models/notification.model");
const User = require("../models/user.model");

// Add a new course
const addCourse = async (req, res) => {
  const user = await User.findById(req.user._id);
  // Check if the user is an admin or a regular user
  if (user && (user.role === "admin" || user.role === "moderator")) {
    // Create a new course with the required properties and set the `id` property to `admin`
    const newCourse = new Course({
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      creator: user.id,
      
    });
    //save the post to the notification
    const notification = new notificationModel({
      title: "New course",
      description: "new internship created",
      time: new Date(),
      read: false,
      link: "/apps/courses/level/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "New course",
      description: "new internship created",
      time: new Date(),
      read: false,
      link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    // Save the new course to the database
    newCourse.save((err, savedCourse) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(savedCourse);
      }
    });
  } else {
    // Check if the course type is valid for regular users
    const allowedTypes = ["resumé"]; // replace with the valid course types for regular users
    if (!allowedTypes.includes(req.body.type)) {
      return res.status(403).send("You cannot create this type of course");
    }
    // Create a new course with the required properties and set the `id` property to `user`
    const newCourse = new Course({
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      creator: user.id,
    });

    //save the post to the notification
    const notification = new notificationModel({
      title: "New internship",
      description: "new internship created",
      time: new Date(),
      read: false,
      //link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    await notification.save();

    //send notification
    socket.getIO().emit("notificationReceived", {
      title: "New internship",
      description: "new course created",
      time: new Date(),
      read: false,
      //link: "/apps/academy/courses/" + req.body.level,
      useRouter: true,
      icon: "heroicons-solid:book-open",
    });
    // Save the new course to the database
    newCourse.save((err, savedCourse) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(savedCourse);
      }
    });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();

    const newCourses = courses.map((course) => {
      return {
        id: course._id,
        type: course.type,
        title: course.title,
        description: course.description,
        duration: course.duration,
        creator: course.creator,
      };
    });
    res.status(200).send(newCourses);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

// Get a single course
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate("category");
    res.status(200).send(course);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};
const getCoursebylevel = async (req, res) => {
  try {
    const type = req.params.type;
    let courses;
    if (type) {
      courses = await Course.find({ type })
        .populate("category")
        .lean();
    } else {
      courses = await Course.find().lean();
    }
    console.log(courses);
    courses.forEach((item) => {
      item.id = item._id;
    });
    res.status(200).send(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

const getCoursebycreator = async (req, res) => {
  try {
    const creator = req.params.creator;
    let courses;
    if (creator) {
      courses = await Course.find({ creator })
        .populate("category")
        .lean();
    } else {
      courses = await Course.find().lean();
    }
    console.log(courses);
    courses.forEach((item) => {
      item.id = item._id;
    });
    res.status(200).send(courses);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const user = await User.findById(req.user._id);

    // Check if the user is an admin or the course belongs to the user
    if (user.role === "admin" || user.courses.includes(courseId)) {
      await Course.findByIdAndDelete(courseId);
      res.send("Course deleted successfully");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// Update a course
const updateCourse = async (req, res) => {
  const user = await User.findById(req.user._id);
  // Check if the user is an admin or a regular user
  if (user && (user.role === "admin" || user.role === "moderator")) {
    try {
      const updatedCours = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send(updatedCours);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  } else {
    const cours = await Course.findById(req.params.id);

    if (user._id == cours.IdUser && cours.type == "resumé") {
      try {
        const allowedTypes = ["resumé"]; // replace with the valid course types for regular users
        if (!allowedTypes.includes(req.body.type)) {
          return res.status(400).send("Invalid course type for this user");
        }
        const updatedCours = await Cours.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updatedCours);
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
    }
  }
};
// update Course Progress
const updateCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    course.progress.currentStep = req.body.progress.currentStep;
    await course.save();
    res.status(200).send(course);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

//get all category
const getAllCategory = async (req, res) => {
  try {
    const categories = await Course.find().distinct("category");
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send({ message: "something went wrong !" });
  }
};

module.exports = {
  addCourse,
  deleteCourse,
  updateCourse,
  getAllCourses,
  getCourse,
  getAllCategory,
  updateCourseProgress,
  getCoursebylevel,
  getCoursebycreator,
};
