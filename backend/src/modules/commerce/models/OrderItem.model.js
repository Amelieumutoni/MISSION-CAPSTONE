const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      references: { model: "orders", key: "order_id" },
    },
    artwork_id: {
      type: DataTypes.INTEGER,
      references: { model: "artworks", key: "artwork_id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  { underscored: true },
);

OrderItem.associate = (models) => {
  OrderItem.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
  OrderItem.belongsTo(models.Artwork, {
    foreignKey: "artwork_id",
    as: "artwork",
  });
};

module.exports = OrderItem;
