const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Profile = sequelize.define(
  "Profile",
  {
    profile_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    bio: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING(100) }, // e.g., "Kigali", "Huye"
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: "default-avatar.png",
    },

    specialty: { type: DataTypes.STRING(100) }, // e.g., "Imigongo", "Weaving"
    years_experience: { type: DataTypes.INTEGER },
    phone_contact: { type: DataTypes.STRING(20) }, // For direct inquiries
  },
  {
    tableName: "profiles",
    timestamps: true,
    underscored: true,
  },
);

Profile.associate = (models) => {
  Profile.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
};
module.exports = Profile;
