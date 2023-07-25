const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const InternshipSchema = new Schema({
 
  type: {
    type: String,
    enum: ["stage pfe", "stage d'été", "autre..", ],
    required: true,
  },
  title: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: false }, // Reference the Category model
  duration: { type: Number, required: false },
  
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Internship", InternshipSchema);
