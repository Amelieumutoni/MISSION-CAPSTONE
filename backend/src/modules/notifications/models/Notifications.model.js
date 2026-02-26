"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Notification = sequelize.define(
  "Notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "user_id" },
    },
    type: {
      type: DataTypes.ENUM(
        "welcome",
        "password_changed",
        "login_new_device",
        "account_suspended",
        "account_reactivated",
        "email_verified",
        "order_placed",
        "order_paid",
        "order_failed",
        "order_cancelled",
        "order_shipped",
        "order_delivered",
        "order_refunded",
        "artwork_sold",
        "artwork_low_stock",
        "artwork_out_of_stock",
        "new_review",
        "artwork_approved",
        "artwork_rejected",
        "artwork_featured",
        "exhibition_published",
        "exhibition_starting",
        "exhibition_live",
        "exhibition_ended",
        "exhibition_viewer_joined",
        "exhibition_archived",
        "new_follower",
        "artwork_liked",
        "artwork_saved",
        "system_maintenance",
        "admin_message",
        "policy_update",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    entity_type: {
      type: DataTypes.ENUM("order", "artwork", "exhibition", "user"),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      allowNull: false,
      defaultValue: "normal",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_dismissed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    underscored: true,
    tableName: "notifications",
  },
);

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: "recipient_id",
    as: "recipient",
  });
  Notification.belongsTo(models.User, {
    foreignKey: "actor_id",
    as: "actor",
  });
};

module.exports = Notification;
