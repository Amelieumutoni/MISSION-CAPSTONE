const { DataTypes } = require("sequelize");
const sequelize = require("../../../utils/database/connection");

const LiveStream = sequelize.define(
  "LiveStream",
  {
    stream_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exhibition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    artist_peer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_viewers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stream_status: {
      type: DataTypes.ENUM("IDLE", "STREAMING", "DISCONNECTED"),
      defaultValue: "IDLE",
    },
  },
  {
    tableName: "live_streams",
    timestamps: true,
    underscored: true,
  },
);

LiveStream.associate = (models) => {
  LiveStream.belongsTo(models.Exhibition, {
    foreignKey: "exhibition_id",
    as: "exhibition",
  });
};

module.exports = LiveStream;
