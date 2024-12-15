// test-gmail.js
require("dotenv").config();
const nodemailer = require("nodemailer");

// Log konfigurasi (kecuali password)
console.log("Checking config:", {
  user: process.env.EMAIL_USER,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
});

// Buat transporter dengan konfigurasi minimal
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // kirim ke diri sendiri untuk test
      subject: "Test Email dari Ahmad Tailor",
      text: "Ini adalah email test",
    });
    console.log("Email berhasil dikirim:", info.messageId);
  } catch (error) {
    console.log("Detail konfigurasi yang digunakan:");
    console.log("- EMAIL_USER:", process.env.EMAIL_USER);
    console.log("- EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("- EMAIL_PORT:", process.env.EMAIL_PORT);
    console.error("Error lengkap:", error);
  }
}

sendTestEmail();
