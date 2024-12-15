// shared/config.js
const path = require("path");
const fs = require("fs");

// Base paths
const SHARED_PATH = path.join(__dirname);
const UPLOADS_PATH = path.join(SHARED_PATH, "uploads");

// Upload paths configuration
const UPLOAD_PATHS = {
  ADMIN: {
    PRODUK: path.join(UPLOADS_PATH, "admin/produk-pakaian"),
    KATEGORI_PERMAK: path.join(UPLOADS_PATH, "admin/kategori-permak"),
  },
  PELANGGAN: {
    PEMBAYARAN: path.join(UPLOADS_PATH, "pelanggan/pembayaran"),
    PERMAK: path.join(UPLOADS_PATH, "pelanggan/pesanan/permak"), // Pastikan path ini benar
  },
};

// Shared helper paths
const HELPER_PATHS = {
  STATUS: path.join(SHARED_PATH, "helpers/statusHelper"),
};

// Fungsi untuk membuat direktori upload
function createUploadDirectories() {
  // Pastikan semua path ada
  Object.values(UPLOAD_PATHS).forEach((category) => {
    Object.values(category).forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });
}

module.exports = {
  UPLOAD_PATHS,
  HELPER_PATHS,
  createUploadDirectories,
};
