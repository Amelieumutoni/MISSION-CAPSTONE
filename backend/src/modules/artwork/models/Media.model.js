const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Media = sequelize.define(
  "Media",
  {
    media_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    artwork_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "artworks",
        key: "artwork_id",
      },
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    media_type: {
      type: DataTypes.ENUM("IMAGE", "VIDEO"),
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "True if this is the main thumbnail for the Artiboard",
    },
  },
  {
    tableName: "artworks_media",
    timestamps: true,
    underscored: true,
  },
);

Media.associate = (models) => {
  Media.belongsTo(models.Artwork, { foreignKey: "artwork_id", as: "artwork" });
};

module.exports = Media;
