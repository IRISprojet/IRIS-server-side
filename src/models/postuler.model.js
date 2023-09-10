const boolean = require("@hapi/joi/lib/types/boolean");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostulerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "internship",
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const postuler = mongoose.model("postuler", PostulerSchema);

module.exports = postuler;
