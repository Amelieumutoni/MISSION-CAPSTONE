"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("profiles", {
      profile_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users", // Name of the target table
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bio: {
        type: Sequelize.TEXT,
      },
      location: {
        type: Sequelize.STRING(100),
      },
      profile_picture: {
        type: Sequelize.STRING,
        defaultValue: "default-avatar.png",
      },
      specialty: {
        type: Sequelize.STRING(100),
      },
      years_experience: {
        type: Sequelize.INTEGER,
      },
      phone_contact: {
        type: Sequelize.STRING(20),
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
    await queryInterface.dropTable("profiles");
  },
};
