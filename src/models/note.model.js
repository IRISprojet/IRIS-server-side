const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  tasks: [
    {
      id: { type: String },
      content: { type: String },
      title: { type: String },
    },
  ],
  image: {type:String,required:false},
  reminder: { type: String },
  //array of label ids
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },
  ],
  archived: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", schema);
