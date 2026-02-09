"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("ADMIN", "AUTHOR", "BUYER"),
        allowNull: false,
        defaultValue: "BUYER",
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: "ACTIVE",
      },
      refreshToken: { type: Sequelize.TEXT, defaultValue: "" },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";',
    );
  },
};
