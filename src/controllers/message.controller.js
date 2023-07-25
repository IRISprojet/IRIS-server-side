const Message = require("../models/message.model");

// POST /Messages - Create a new Message
const createMessage = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.params.id);
    const message = new Message({
      conversation: req.params.id,
      user: req.user._id,
      value: req.body.value,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.log(error);
  }
};

// GET /Messages/:conversationId - Get a Message by ID
const getMessagesById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.find({
      conversation: id,
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(200).json(message);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createMessage,
  getMessagesById,
};
