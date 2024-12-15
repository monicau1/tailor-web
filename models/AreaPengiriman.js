// models/AreaPengiriman.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const AreaPengiriman = sequelize.define(
  "AreaPengiriman",
  {
    id_area: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_area: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      // Untuk kebutuhan referensi, misal: JKT_BARAT
    },
    nama_area: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // Contoh: "Jakarta Barat"
    },
    biaya_pengiriman: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    zona: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_pengiriman: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status_pickup: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "area_pengiriman",
    timestamps: false,
  }
);

module.exports = AreaPengiriman;
