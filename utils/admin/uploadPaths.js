// utils/uploadPaths.js
const path = require("path");

// Base path ke folder shared uploads
const SHARED_UPLOADS_PATH = path.join(__dirname, "../../shared/uploads");

// Path untuk setiap jenis upload
const PATHS = {
  ADMIN_PAKAIAN: path.join(SHARED_UPLOADS_PATH, "admin/produk-pakaian"),
  ADMIN_KATEGORI_PERMAK: path.join(
    SHARED_UPLOADS_PATH,
    "admin/kategori-permak"
  ),
  PELANGGAN_PESANAN: path.join(SHARED_UPLOADS_PATH, "pelanggan/pesanan"),
  PELANGGAN_PEMBAYARAN: path.join(SHARED_UPLOADS_PATH, "pelanggan/pembayaran"),
};

// Fungsi untuk memastikan folder ada
const createUploadDirectories = () => {
  const fs = require("fs");
  Object.values(PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

module.exports = {
  PATHS,
  SHARED_UPLOADS_PATH,
  createUploadDirectories,
};
