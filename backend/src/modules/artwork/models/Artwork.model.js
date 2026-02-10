const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Artwork = sequelize.define(
  "Artwork",
  {
    artwork_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    technique: { type: DataTypes.STRING(100) },
    materials: { type: DataTypes.STRING(255) },
    dimensions: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Format: L x W x H in cm",
    },
    creation_year: { type: DataTypes.INTEGER },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    main_image: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("AVAILABLE", "SOLD", "ARCHIVED"),
      defaultValue: "AVAILABLE",
    },
  },
  {
    tableName: "artworks",
    timestamps: true,
    underscored: true,
  },
);

Artwork.associate = (models) => {
  Artwork.belongsTo(models.User, { foreignKey: "author_id", as: "author" });
  Artwork.hasMany(models.Media, { foreignKey: "artwork_id", as: "gallery" });
  Artwork.belongsToMany(models.Exhibition, {
    through: "artwork_exhibitions",
    foreignKey: "artwork_id",
    otherKey: "exhibition_id",
    as: "exhibitions",
  });
};

module.exports = Artwork;
