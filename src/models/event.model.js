const boolean = require("@hapi/joi/lib/types/boolean");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "status", "image"],
    required: false,
  },
  media: {
    type: {
      type: String,
      required: false,
    },
    preview: {
      type: String,
      required: false,
    },
  },
  time: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Like",
      required: false,
    },
  ],

  comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: false }], // Reference the comment model
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
});

PostSchema.virtual("displayName", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
  options: { select: "displayName" },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
