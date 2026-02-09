// src/modules/authentication/models/User.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection"); // import the instance

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    role: {
      type: DataTypes.ENUM("ADMIN", "AUTHOR", "BUYER"),
      allowNull: false,
      defaultValue: "BUYER",
    },
    status: { type: DataTypes.STRING(20), defaultValue: "ACTIVE" },
    refreshToken: { type: DataTypes.TEXT, defaultValue: "" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

module.exports = User;
