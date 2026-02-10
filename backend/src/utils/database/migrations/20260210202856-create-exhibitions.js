"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exhibitions", {
      exhibition_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      type: {
        type: Sequelize.ENUM("CLASSIFICATION", "LIVE"),
        defaultValue: "CLASSIFICATION",
      },
      banner_image: { type: Sequelize.STRING },
      stream_link: { type: Sequelize.STRING },
      start_date: { type: Sequelize.DATE },
      end_date: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("artwork_exhibitions", {
      ex_art_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exhibition_id: {
        type: Sequelize.INTEGER,
        references: { model: "exhibitions", key: "exhibition_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      artwork_id: {
        type: Sequelize.INTEGER,
        references: { model: "artworks", key: "artwork_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("artwork_exhibitions");
    await queryInterface.dropTable("exhibitions");
  },
};
