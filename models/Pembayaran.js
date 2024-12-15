const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pembayaran = sequelize.define(
  "Pembayaran",
  {
    id_pembayaran: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tanggal_pembayaran: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    batas_waktu_pembayaran: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    metode_pembayaran: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    bank_asal: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nama_rekening: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nomor_rekening: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    jumlah_dibayar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status_pembayaran: {
      type: DataTypes.ENUM("pending", "paid", "expired", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    bukti_pembayaran: {
      type: DataTypes.STRING(255),
    },
    catatan_pembayaran: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "pembayaran",
    timestamps: false,
  }
);

module.exports = Pembayaran;
