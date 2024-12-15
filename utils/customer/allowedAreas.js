// utils/allowedAreas.js

// Definisi area yang diizinkan (ID kota berdasarkan RajaOngkir)
const ALLOWED_AREAS = {
  // Jakarta
  "Jakarta Pusat": "152",
  "Jakarta Utara": "153",
  "Jakarta Barat": "151",
  "Jakarta Selatan": "154",
  "Jakarta Timur": "155",
  // Tangerang
  Tangerang: "456",
  "Tangerang Selatan": "457",
  "Kota Tangerang": "455",
};

// Daftar ID Provinsi yang diizinkan
const ALLOWED_PROVINCES = [
  "6", // DKI Jakarta
  "3", // Banten (untuk Tangerang)
];

module.exports = {
  ALLOWED_AREAS,
  ALLOWED_PROVINCES,
};
