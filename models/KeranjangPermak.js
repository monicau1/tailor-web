// models/KeranjangPermak.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const KeranjangPermak = sequelize.define(
  "KeranjangPermak",
  {
    id_keranjang_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_keranjang: {
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
    tableName: "keranjang_permak",
    timestamps: false,
  }
);

module.exports = KeranjangPermak;
