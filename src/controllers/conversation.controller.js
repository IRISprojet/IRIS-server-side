const Conversation = require("../models/conversation.model");
const Chat = require("../models/chat.model");

// GET /conversations - Get all conversations
const getConversations = async (req, res) => {
  try {
    // find all conversations where the user is the sender or the receiver

    const conversations = await Conversation.find({
      $or: [{ user: req.user._id }, { contactId: req.user._id }],
    })
      .populate("contactId")
      .populate("user")
      .lean();

    // add id to conversations
    conversations.forEach((conversation) => {
      conversation.id = conversation._id;
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.log(error);
  }
};

// POST /conversations - Create a new conversation
const createConversation = async (req, res) => {
  try {
    //req.body.lastMessageAt = new Date(lastMessageAt);
    const conversation = new Conversation({ ...req.body });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.log(error);
  }
};

// GET /chats - Get all chats
const getChats = async (req, res) => {
  try {
    // get all chats except the ones where the user is the sender or there is an existing conversation
    const conversations1 = await Conversation.find({ user: req.user._id }).lean();
    const conversationIds1 = conversations1.map(({ contactId }) => contactId);

    const conversations2 = await Conversation.find({ contactId: req.user._id }).lean();
    const conversationIds2 = conversations2.map(({ user }) => user);

    const conversationsIds = [...conversationIds1, ...conversationIds2, req.user._id];

    const chats = await Chat.find({ user: { $nin: conversationsIds } })
      .populate("user")
      .lean();

    chats.forEach((chart) => {
      Object.assign(chart, { id: chart._id });
    });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getChats,
};
