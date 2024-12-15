// resetDB.js (ini admin website)
require("dotenv").config();
const mysql = require("mysql2");
const sequelize = require("./utils/db.js");

async function resetDatabase() {
  let connection;
  try {
    // Buat koneksi MySQL
    connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log("Menghapus database lama...");
    await connection
      .promise()
      .query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);

    console.log("Membuat database baru...");
    await connection.promise().query(`CREATE DATABASE ${process.env.DB_NAME}`);

    // Tutup koneksi awal
    await connection.promise().end();

    // Hubungkan ke database baru
    await sequelize.authenticate();

    console.log("Membuat ulang tabel...");
    // Buat ulang semua tabel
    await sequelize.sync({ force: true });

    console.log("Database berhasil di-reset!");
    process.exit(0);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    if (connection) {
      await connection.promise().end();
    }
    process.exit(1);
  }
}

resetDatabase();
