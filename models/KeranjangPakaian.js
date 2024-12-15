const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const KeranjangPakaian = sequelize.define(
  "KeranjangPakaian",
  {
    id_keranjang_pakaian: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_keranjang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_varian_pakaian: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kuantitas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    harga_per_item: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "keranjang_pakaian",
    timestamps: false,
  }
);

module.exports = KeranjangPakaian;
