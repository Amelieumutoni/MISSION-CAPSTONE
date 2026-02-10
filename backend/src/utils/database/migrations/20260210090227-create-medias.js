"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("artworks_media", {
      media_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      artwork_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "artworks", // Targets the artworks table we just created
          key: "artwork_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      file_path: { type: Sequelize.STRING, allowNull: false },
      media_type: {
        type: Sequelize.ENUM("IMAGE", "VIDEO"),
        allowNull: false,
      },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("artworks_media");
  },
};
