"use strict";

const { QueryInterface } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("live_streams", {
      stream_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exhibition_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // One stream session per exhibition
        references: { model: "exhibitions", key: "exhibition_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      artist_peer_id: {
        type: Sequelize.STRING,
        allowNull: true, // Generated only when the artist clicks "Go Live"
      },
      current_viewers: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_views: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      stream_status: {
        type: Sequelize.ENUM("IDLE", "STREAMING", "DISCONNECTED"),
        defaultValue: "IDLE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("live_streams");
  },
};
