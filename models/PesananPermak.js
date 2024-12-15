// models/PesananPermak.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const PesananPermak = sequelize.define(
  "PesananPermak",
  {
    id_pesanan_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_kategori_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deskripsi_pakaian: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    gambar_permak: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "pesanan_permak",
    timestamps: false,
  }
);

module.exports = PesananPermak;
