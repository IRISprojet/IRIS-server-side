const boolean = require("@hapi/joi/lib/types/boolean");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;
