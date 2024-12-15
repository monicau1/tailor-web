// models/InstruksiKhususPermak.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const InstruksiKhususPermak = sequelize.define(
  "InstruksiKhususPermak",
  {
    id_instruksi_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipe_instruksi: {
      type: DataTypes.ENUM("alterasi", "perbaikan"),
      allowNull: false,
    },
    catatan_perubahan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Diisi jika tipe instruksi adalah alterasi",
    },
    lokasi_perbaikan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Diisi jika tipe instruksi adalah perbaikan",
    },
    deskripsi_perbaikan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Diisi jika tipe instruksi adalah perbaikan",
    },
    catatan_tambahan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Catatan tambahan opsional untuk semua tipe",
    },
  },
  {
    tableName: "instruksi_khusus_permak",
    timestamps: false,
  }
);

module.exports = InstruksiKhususPermak;
