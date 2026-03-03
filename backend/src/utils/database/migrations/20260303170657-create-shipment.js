"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("shipments", {
      shipment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "order_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tracking_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      carrier: {
        type: Sequelize.STRING, // e.g., DHL, FedEx
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SHIPPED", "DELIVERED"),
        defaultValue: "PENDING",
      },
      shipped_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("shipments");
  },
};
