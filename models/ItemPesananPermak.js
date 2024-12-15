// models/ItemPesananPermak.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const ItemPesananPermak = sequelize.define(
  "ItemPesananPermak",
  {
    id_item_pesanan_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_instruksi_permak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kuantitas: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    harga_per_item: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "item_pesanan_permak",
    timestamps: false,
  }
);

module.exports = ItemPesananPermak;
