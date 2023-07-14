const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    required: true,
  },
  link: {
    type: String,
    required: false,
  },
  useRouter: {
    type: Boolean,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
