const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const ItemKeranjangPermak = sequelize.define(
  "ItemKeranjangPermak",
  {
    id_item_keranjang_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_keranjang_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_instruksi_permak: {
      // Tambahkan ini
      type: DataTypes.INTEGER,
      allowNull: true, // boleh null karena mungkin tidak selalu ada instruksi khusus
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
    tableName: "item_keranjang_permak",
    timestamps: false,
  }
);

module.exports = ItemKeranjangPermak;
