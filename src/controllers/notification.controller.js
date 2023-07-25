const Notification = require("../models/notification.model");

// GET /Notifications - Get all Notifications
const getNotifications = async (req, res) => {
  try {
    // get my notifications
    const response = [];
    console.log(req.user._id);

    const notifications = await Notification.find({ read: false }).sort({ time: -1 }).lean();
    notifications.forEach((notification) => {
      if (req.user._id == notification?.user?.toString()) {
        response.push(notification);
      } else if (!notification.user) {
        response.push(notification);
      }
    });
    //add id to the notification object
    response.forEach((notification) => {
      notification.id = notification._id;
      delete notification._id;
      delete notification.__v;
    });

    res.status(201).send(response);
  } catch (error) {
    console.log(error);
  }
};
// update read status
const updateNotifications = async (req, res) => {
  try {
    const id = req.params.id;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
// update all read status
const updateAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true },
      { new: true }
    );
    if (!notifications) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  getNotifications,
  updateNotifications,
  updateAllNotifications,
};
