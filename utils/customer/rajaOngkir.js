const axios = require("axios");
const { ALLOWED_AREAS, ALLOWED_PROVINCES } = require("./allowedAreas");
require("dotenv").config();

const RAJAONGKIR_KEY = process.env.RAJAONGKIR_KEY;
const RAJAONGKIR_URL = "https://api.rajaongkir.com/starter";
const ORIGIN_CITY = "151"; // Jakarta Barat sebagai lokasi toko

const rajaOngkirAPI = axios.create({
  baseURL: RAJAONGKIR_URL,
  headers: { key: RAJAONGKIR_KEY },
});

// Get daftar provinsi (hanya Jakarta dan Banten)
const getProvinces = async () => {
  try {
    const response = await rajaOngkirAPI.get("/province");
    const provinces = response.data.rajaongkir.results;

    // Filter hanya provinsi yang diizinkan
    return provinces.filter((province) =>
      ALLOWED_PROVINCES.includes(province.province_id)
    );
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw new Error("Gagal mengambil data provinsi");
  }
};

// Get daftar kota (hanya area yang diizinkan)
const getCities = async (provinceId) => {
  try {
    if (!ALLOWED_PROVINCES.includes(provinceId)) {
      throw new Error("Provinsi tidak tersedia untuk pengiriman");
    }

    const response = await rajaOngkirAPI.get(`/city?province=${provinceId}`);
    const cities = response.data.rajaongkir.results;

    // Filter hanya kota yang diizinkan
    return cities.filter((city) =>
      Object.values(ALLOWED_AREAS).includes(city.city_id)
    );
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw new Error("Gagal mengambil data kota");
  }
};

// Hitung ongkir dengan validasi area
const calculateShipping = async (destination, weight) => {
  try {
    // Validasi area pengiriman
    if (!Object.values(ALLOWED_AREAS).includes(destination)) {
      throw new Error("Area pengiriman tidak tersedia");
    }

    const params = {
      origin: ORIGIN_CITY,
      destination: destination,
      weight: weight * 1000, // Konversi ke gram
      courier: "jne",
    };

    const response = await rajaOngkirAPI.post("/cost", params);
    const costs = response.data.rajaongkir.results[0].costs;

    // Ambil layanan REG
    const regService = costs.find((cost) => cost.service === "REG");

    if (!regService) {
      throw new Error("Layanan pengiriman tidak tersedia untuk rute ini");
    }

    return {
      cost: regService.cost[0].value,
      etd: regService.cost[0].etd,
    };
  } catch (error) {
    console.error("Error calculating shipping:", error);
    throw new Error(error.message || "Gagal menghitung ongkir");
  }
};

module.exports = {
  getProvinces,
  getCities,
  calculateShipping,
  ALLOWED_AREAS,
};
