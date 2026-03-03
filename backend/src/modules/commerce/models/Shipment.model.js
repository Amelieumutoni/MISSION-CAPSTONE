const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const Shipment = sequelize.define(
  "Shipment",
  {
    shipment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tracking_number: DataTypes.STRING,
    carrier: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("PENDING", "SHIPPED", "DELIVERED"),
      defaultValue: "PENDING",
    },
    shipped_at: DataTypes.DATE,
  },
  {
    tableName: "shipments",
    underscored: true,
    timestamps: true,
  },
);

Shipment.associate = (models) => {
  Shipment.belongsTo(models.Order, { foreignKey: "order_id" });
};

module.exports = Shipment;
