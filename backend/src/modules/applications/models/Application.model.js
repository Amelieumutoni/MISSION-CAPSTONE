// models/ArchiveApplication.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const ArchiveApplication = sequelize.define(
  "ArchiveApplication",
  {
    application_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    institution: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    research_purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    access_link: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL to the archived material (provided upon approval)",
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Internal notes from admin",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Expiration date for access (if applicable)",
    },
  },
  {
    tableName: "archive_applications",
    underscored: true,
    timestamps: true,
  },
);

module.exports = ArchiveApplication;
