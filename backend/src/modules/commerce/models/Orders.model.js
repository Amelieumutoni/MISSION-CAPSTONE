const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Order = sequelize.define(
  "Order",
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    stripe_session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: "buyer_id", as: "buyer" });
  if (models.OrderItem) {
    Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
  }
};

module.exports = Order;
