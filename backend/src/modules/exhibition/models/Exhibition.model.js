const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Exhibition = sequelize.define(
  "Exhibition",
  {
    exhibition_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM("CLASSIFICATION", "LIVE"),
      allowNull: false,
      defaultValue: "CLASSIFICATION",
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    banner_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    stream_link: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    start_date: { type: DataTypes.DATE },
    end_date: { type: DataTypes.DATE },
  },
  {
    tableName: "exhibitions",
    timestamps: true,
    underscored: true,
  },
);

Exhibition.associate = (models) => {
  Exhibition.belongsToMany(models.Artwork, {
    through: "artwork_exhibitions",
    foreignKey: "exhibition_id",
    otherKey: "artwork_id",
    as: "artworks",
  });
};

module.exports = Exhibition;
