const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

// GET /notifications/
router.get("/notifications", notificationController.getNotifications);

// put /notifications/:id
router.put("/notifications/:id", notificationController.updateNotifications);

// put /notifications/
router.put("/notifications", notificationController.updateAllNotifications);

module.exports = router;
