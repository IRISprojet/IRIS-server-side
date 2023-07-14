const notificationModel = require("../models/notification.model");

const notificationSocket = async function (socket) {
  socket.on("addNotification", async (data) => {
    console.log(data);
    // add notification in the database
    const notification = new notificationModel({
      ...data,
    });
    await notification.save();
    // add id to the notification object
    const newNotification = { ...notification._doc };
    newNotification.id = newNotification._id;
    delete newNotification._id;
    delete newNotification.__v;
    console.log(newNotification);

    // emit socket to all connected users
    socket.broadcast.emit("notificationReceived", newNotification);
  });
};
module.exports = notificationSocket;
