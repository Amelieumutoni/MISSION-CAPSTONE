"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("artworks", {
      artwork_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      technique: { type: Sequelize.STRING(100) },
      materials: { type: Sequelize.STRING(255) },
      dimensions: { type: Sequelize.STRING(100) },
      creation_year: { type: Sequelize.INTEGER },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock_quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      main_image: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM("AVAILABLE", "SOLD", "ARCHIVED"),
        defaultValue: "AVAILABLE",
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("artworks");
  },
};
