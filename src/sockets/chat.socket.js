const redisClient = require("../../redis");
const Chat = require("../models/chat.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const notificationModel = require("../models/notification.model");

const chatSocket = async function (socket) {
  socket.on("sendMessage", async (data) => {
    // first time the user sends a message to another user, we create a conversation
    // check if the conversation already exists
    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) {
      // create a new conversation
      // in case this is the first message the user sends to another user, the conversation id is the contact id
      const newConversation = new Conversation({
        user: data.userId,
        contactId: data.conversationId,
        lastMessage: data.messageText,
        lastMessageAt: new Date(),
      });
      const savedConversation = await newConversation.save();

      data.contactId = data.conversationId;
      data.conversationId = savedConversation._id;
    }

    // save message in database
    const message = new Message({
      conversation: data.conversationId,
      user: data.userId,
      value: data.messageText,
    });
    await message.save();
    // get the socket id of the user we want to send the message to

    const socketId = await redisClient.hGet("online users", data.contactId);
    // send the message to the user
    if (socketId) socket.to(socketId).emit("messageReceived", message);
    // send the message to the sender
    socket.emit("messageReceived", message);
    // update the conversation last message and last message at
    await Conversation.findByIdAndUpdate(
      data.conversationId,
      {
        lastMessage: data.messageText,
        lastMessageAt: new Date(),
      },
      { new: true }
    );
    // save a notification in the database
    const notification = new notificationModel({
      title: "New message",
      description: "You have a new message",
      time: new Date(),
      read: false,
      link: "/apps/chat/" + data.conversationId,
      useRouter: true,
      icon: "heroicons-solid:chat",
      user: data.contactId,
    });
    await notification.save();
    // add id to the notification object
    const newNotification = { ...notification._doc };
    newNotification.id = newNotification._id;
    delete newNotification._id;
    delete newNotification.__v;

    // send notification to the user
    socket.to(socketId).emit("notificationReceived", newNotification);
  });
};

module.exports = chatSocket;
