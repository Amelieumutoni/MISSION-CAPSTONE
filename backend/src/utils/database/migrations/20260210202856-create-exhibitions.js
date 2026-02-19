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
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // make sure this matches your users table name
          key: "user_id",
        },
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      type: {
        type: Sequelize.ENUM("CLASSIFICATION", "LIVE"),
        defaultValue: "CLASSIFICATION",
      },
      status: {
        type: Sequelize.ENUM("UPCOMING", "LIVE", "ARCHIVED"),
        defaultValue: "UPCOMING",
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
      author_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "user_id" },
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
