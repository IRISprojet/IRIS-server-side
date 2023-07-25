const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");

// GET /conversations
router.get("/", conversationController.getConversations);

// POST /conversations
router.post("/", conversationController.createConversation);

//GET /chats
router.get("/chats", conversationController.getChats);

module.exports = router;
