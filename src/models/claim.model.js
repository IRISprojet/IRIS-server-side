const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const claimSchema = new Schema(
  {
    claimName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
