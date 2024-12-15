const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

// models/Pelanggan.js
const Pelanggan = sequelize.define(
  "Pelanggan",
  {
    id_pelanggan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_alamat_pelanggan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nama_pelanggan: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email_pelanggan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        // Hanya validasi email jika field tidak kosong
        isEmail: {
          args: true,
          msg: "Format email tidak valid",
        },
        // Custom validator untuk mengizinkan email kosong
        customValidator(value) {
          if (value === "" || value === null) {
            // Jika email kosong, set ke null
            this.setDataValue("email_pelanggan", null);
          }
        },
      },
    },
    password_pelanggan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nomor_telepon_pelanggan: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tanggal_registrasi_pelanggan: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pelanggan",
    timestamps: false,
  }
);

module.exports = Pelanggan;
