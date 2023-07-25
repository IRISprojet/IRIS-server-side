const userModel = require("../models/user.model");
const noteModel = require("../models/note.model");
const multerMiddleware = require("../middleware/multer.middleware");
const cloudinaryMiddleware = require("../middleware/cloudinary.middleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
//get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await noteModel.find().lean();
    notes.forEach((note) => {
      note.id = note._id;
      return note;
    });
    res.send(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get notes" });
  }
};
//
//add note
const addNote = async (req, res) => {
  try {
    multerMiddleware.any()(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      let imageUrl;

      if (req.files && req.files.length > 0) {
        const file = req.files[0];

        // Use Cloudinary to upload the image
        const result = await cloudinary.uploader.upload(file.path);

        // Access the uploaded image URL via result.secure_url
        imageUrl = result.secure_url;
      }

      const note = new noteModel({
        title: req.body.title,
        content: req.body.content,
        tasks: req.body.tasks,
        image: imageUrl,
        reminder: req.body.reminder,
        archived: req.body.archived,
      });

      await note.save();
      const savedNote = await noteModel.findById(note._id).lean();
      savedNote.id = savedNote._id;

      res.status(201).send(savedNote);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save note" });
  }
};

//update note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    multerMiddleware.any()(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      let imageUrl;

      if (req.files && req.files.length > 0) {
        const file = req.files[0];

        const result = await cloudinary.uploader.upload(file.path);

        imageUrl = result.secure_url;
      }

      const updatedFields = {
        title: req.body.title,
        content: req.body.content,
        tasks: req.body.tasks,
        image: imageUrl,
        reminder: req.body.reminder,
        labels: req.body.labels,
        archived: req.body.archived,
      };

      const updatedNote = await noteModel
        .findByIdAndUpdate(id, updatedFields, { new: true })
        .lean();

      if (!updatedNote) {
        return res.status(404).json({ error: "Note not found" });
      }

      updatedNote.id = updatedNote._id;
      res.status(200).send(updatedNote);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update note" });
  }
};

//delete note
const deleteNote = async (req, res) => {
  try {
    const deletedNote = await noteModel.findByIdAndDelete(req.params.id);
    res.send(req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
};






module.exports = {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
  
};
