// utils/imageHelper.js
const path = require("path");
const fs = require("fs");

const SHARED_UPLOADS_PATH = path.join(__dirname, "../../shared/uploads");

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.chmodSync(dirPath, "755"); // Set permission ke 755
  }
}

function initializeUploadFolders() {
  const folders = [
    path.join(SHARED_UPLOADS_PATH, "admin/produk"),
    path.join(SHARED_UPLOADS_PATH, "admin/kategori"),
    path.join(SHARED_UPLOADS_PATH, "pelanggan/pesanan"),
    path.join(SHARED_UPLOADS_PATH, "pelanggan/pembayaran"),
  ];

  folders.forEach((folder) => {
    ensureDirectoryExists(folder);
  });
}

function getProdukImagePath(filename) {
  if (!filename) return "/uploads/admin/produk-pakaian/default-produk.jpg";
  return `/uploads/admin/produk-pakaian/${filename}`;
}

function getKategoriImagePath(filename) {
  if (!filename) return "/uploads/admin/kategori-permak/default-kategori.jpg";
  return `/uploads/admin/kategori-permak/${filename}`;
}

function getPesananImagePath(filename) {
  if (!filename) return "/uploads/pelanggan/pesanan/default-pesanan.jpg";
  return `/uploads/pelanggan/pesanan/${filename}`;
}

function getPembayaranImagePath(filename) {
  if (!filename) return "/uploads/pelanggan/pembayaran/default-pembayaran.jpg";
  return `/uploads/pelanggan/pembayaran/${filename}`;
}

module.exports = {
  initializeUploadFolders,
  getProdukImagePath,
  getKategoriImagePath,
  getPesananImagePath,
  getPembayaranImagePath,
  SHARED_UPLOADS_PATH,
};
