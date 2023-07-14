const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StageSchema = new Schema({
  level: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
  },
  type: {
    type: String,
    enum: ["PFE", "été", "autre"],
    required: true,
  },
  title: { type: String, required: true, unique: true },
  slug: { type: String, required: false, unique: true },
  description: { type: String, required: false },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, // Reference the Category model
  duration: { type: Number, required: false },
  featured: { type: Boolean, default: false },
 
   
 
  steps: [
    {
      title: { type: String, required: true },
      subtitle: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Stage", StageSchema);
