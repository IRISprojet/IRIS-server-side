const express = require("express");
const router = express.Router();
// import middleware
const { isAuth, isAdmin } = require("../middleware");
const {
  addLabel,
  getLabels,
  updateLabel,
  deleteLabel,
  addNote,
  updateNote,
  getAllNotes,
  deleteNote,
} = require("../controllers/note.controller");
// import controller register

//routes

// //get all labels
// router.get("/labels", /*  isAuth */ getLabels);

// //add label
// router.post("/label", /*  isAuth,  */ addLabel);

// //update label
// router.put("/label/:id", /*  isAuth,  */ updateLabel);

// //delete label
// router.delete("/label/:id", /*  isAuth,  */ deleteLabel);

//get all notes
router.get("/notes", /*  isAuth,  */ getAllNotes);

//add note
router.post("/note", /*  isAuth,  */ addNote);

//update note
router.put("/note/:id", /* isAuth, */ updateNote);  

//delete note
router.delete("/note/:id", /*  isAuth,  */ deleteNote);

module.exports = router;
