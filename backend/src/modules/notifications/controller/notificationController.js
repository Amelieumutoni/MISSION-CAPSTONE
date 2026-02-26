"use strict";

const { Notification, User } = require("../../index");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipient_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications." });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    await notification.update({ is_read: true });

    res.status(200).json({ success: true, message: "Marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification." });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { recipient_id: req.user.id, is_read: false } },
    );

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications." });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deleted = await Notification.destroy({
      where: {
        notification_id: notificationId,
        recipient_id: req.user.id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification." });
  }
};

exports.getAdminAlerts = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied." });
    }

    const alerts = await Notification.findAll({
      where: {
        recipient_id: req.user.id,
        priority: ["urgent", "high"],
      },
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin alerts." });
  }
};
