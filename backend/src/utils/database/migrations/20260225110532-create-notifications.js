"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      notification_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // Who receives this notification
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onDelete: "CASCADE",
      },

      // Who triggered it (null = system notification)
      actor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "user_id" },
        onDelete: "SET NULL",
      },

      type: {
        type: Sequelize.ENUM(
          "welcome",
          "password_changed",
          "login_new_device",
          "account_suspended",
          "account_reactivated",
          "email_verified",
          // Commerce — buyer
          "order_placed",
          "order_paid",
          "order_failed",
          "order_cancelled",
          "order_shipped",
          "order_delivered",
          "order_refunded",
          // Commerce — seller
          "artwork_sold",
          "artwork_low_stock",
          "artwork_out_of_stock",
          "new_review",
          // Artwork
          "artwork_approved",
          "artwork_rejected",
          "artwork_featured",
          // Exhibitions
          "exhibition_published",
          "exhibition_starting",
          "exhibition_live",
          "exhibition_ended",
          "exhibition_viewer_joined",
          "exhibition_archived",
          // Social
          "new_follower",
          "artwork_liked",
          "artwork_saved",
          // System
          "system_maintenance",
          "admin_message",
          "policy_update",
        ),
        allowNull: false,
      },

      // Human-readable title shown in the notification bell
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      // Full message body
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      link: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      entity_type: {
        type: Sequelize.ENUM("order", "artwork", "exhibition", "user"),
        allowNull: true,
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      priority: {
        type: Sequelize.ENUM("low", "normal", "high", "urgent"),
        allowNull: false,
        defaultValue: "normal",
      },

      // Read state
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      is_dismissed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // Optional extra payload as JSON (order total, artwork title, etc.)
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      "notifications",
      ["recipient_id", "is_read"],
      {
        name: "idx_notifications_recipient_unread",
      },
    );

    // Feed query: latest notifications for a user
    await queryInterface.addIndex(
      "notifications",
      ["recipient_id", "created_at"],
      { name: "idx_notifications_recipient_created" },
    );

    // Filter by type
    await queryInterface.addIndex("notifications", ["recipient_id", "type"], {
      name: "idx_notifications_recipient_type",
    });

    // Polymorphic lookups
    await queryInterface.addIndex(
      "notifications",
      ["entity_type", "entity_id"],
      { name: "idx_notifications_entity" },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notifications");
  },
};
