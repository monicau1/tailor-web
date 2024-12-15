// shared/helpers/statusHelper.js

// Daftar lengkap status yang valid
const STATUS_PESANAN = {
  MENUNGGU_PEMBAYARAN: "menunggu pembayaran",
  MENUNGGU_KONFIRMASI: "menunggu konfirmasi pembayaran",
  DIPROSES: "diproses",
  DIKIRIM: "dikirim",
  SELESAI: "selesai",
  DIBATALKAN: "dibatalkan",
};

// Daftar status untuk ditampilkan ke user
const STATUS_DISPLAY = {
  "menunggu pembayaran": "Menunggu Pembayaran",
  "menunggu konfirmasi pembayaran": "Menunggu Konfirmasi Pembayaran",
  diproses: "Dalam Proses",
  dikirim: "Dalam Pengiriman",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

// Warna untuk setiap status
const STATUS_COLORS = {
  "menunggu pembayaran": "warning",
  "menunggu konfirmasi pembayaran": "warning",
  diproses: "info",
  dikirim: "primary",
  selesai: "success",
  dibatalkan: "danger",
};

// Fungsi untuk mendapatkan display text status
function getStatusDisplay(status) {
  return STATUS_DISPLAY[status] || status;
}

// Fungsi untuk mendapatkan warna status
function getStatusColor(status) {
  return STATUS_COLORS[status] || "secondary";
}

// Fungsi untuk validasi status
function isValidStatus(status) {
  return Object.values(STATUS_PESANAN).includes(status);
}

// Export semua yang dibutuhkan
module.exports = {
  STATUS_PESANAN,
  STATUS_DISPLAY,
  STATUS_COLORS,
  getStatusDisplay,
  getStatusColor,
  isValidStatus,
};
