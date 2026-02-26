const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");

router.get("/", authGuard(), notificationController.getMyNotifications);
router.get(
  "/admin-alerts",
  authGuard("ADMIN"),
  notificationController.getAdminAlerts,
);
router.patch("/read-all", authGuard(), notificationController.markAllAsRead);
router.patch(
  "/:notificationId/read",
  authGuard(),
  notificationController.markAsRead,
);
router.delete(
  "/:notificationId",
  authGuard(),
  notificationController.deleteNotification,
);

module.exports = router;
