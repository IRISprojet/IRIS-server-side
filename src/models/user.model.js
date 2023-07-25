const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const schema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "staff", "moderator"],
      default: "user",
    },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    from: { type: String, default: "Esprit Community" },
    photoURL: { type: String, required: false },
    isBanned: { type: Boolean, default: false },
    phone: { type: String, required: false },
    TFA: { type: Boolean, default: false },
    TFA_type: {
      type: String,
      enum: ["email", "authenticator", "face_id", "mfa"],
      default: "mfa",
    },
    status: {
      type: String,
      enum: ["online", "away", "do-not-disturb", "offline"],
      default: "offline",
    },
    //eya
    image: { type: String, required: false },
    profilePicture: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
