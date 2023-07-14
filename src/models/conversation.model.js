const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  lastMessage: {
    type: String,
    required: true,
  },
  lastMessageAt: {
    type: Date,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
