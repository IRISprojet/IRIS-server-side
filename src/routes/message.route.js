const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

// GET /Messages/:id
router.get("/:id", messageController.getMessagesById);

// POST /Messages
router.post("/:id", messageController.createMessage);

module.exports = router;
