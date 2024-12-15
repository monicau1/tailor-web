// utils/uploadPaths.js
const path = require("path");
const fs = require("fs");

const PATHS = {
  SHARED_ROOT: path.join(__dirname, "../../shared"),
  UPLOADS: path.join(__dirname, "../../shared/uploads"),
  ADMIN_PRODUK: path.join(
    __dirname,
    "../../shared/uploads/admin/produk-pakaian"
  ),
  ADMIN_KATEGORI: path.join(
    __dirname,
    "../../shared/uploads/admin/kategori-permak"
  ),
  PELANGGAN_PESANAN: path.join(
    __dirname,
    "../../shared/uploads/pelanggan/pesanan"
  ),
  PELANGGAN_PEMBAYARAN: path.join(
    __dirname,
    "../../shared/uploads/pelanggan/pembayaran"
  ),
};

const createUploadDirectories = () => {
  Object.values(PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // Set permission ke 755 untuk memastikan readable
      fs.chmodSync(dir, "755");
    }
  });
};

module.exports = {
  PATHS,
  createUploadDirectories,
};
