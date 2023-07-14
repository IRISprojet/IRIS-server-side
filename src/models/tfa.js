const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    tempSecret: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tfa", schema);
