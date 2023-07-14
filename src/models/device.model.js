const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    refreshToken: { type: String },
    visitorId: { type: String },
    isVerified: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", schema);
