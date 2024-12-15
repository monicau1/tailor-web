// models/Pengiriman.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pengiriman = sequelize.define(
  "Pengiriman",
  {
    id_pengiriman: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Alamat pengambilan
    id_alamat_pickup: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "alamat_pelanggan",
        key: "id_alamat_pelanggan",
      },
    },
    // Alamat pengantaran
    id_alamat_return: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "alamat_pelanggan",
        key: "id_alamat_pelanggan",
      },
    },
    metode_pengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metode_pengembalian: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    perkiraan_tanggal_pengiriman: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    perkiraan_tanggal_pengembalian: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status_pengiriman: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
    },
    biaya_pengiriman: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    biaya_pengembalian: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "pengiriman",
    timestamps: false,
  }
);

module.exports = Pengiriman;
