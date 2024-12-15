// routes/customer/layanan/permakRoutes.js
const express = require("express");
const router = express.Router();
const permakController = require("../../../controllers/customer/layanan/permakController");
const {
  handleUploadPermak,
} = require("../../../middleware/customer/uploadMiddleware");

// Pastikan bahwa permakController.addToCart ada dan diexport dengan benar
console.log("permakController methods:", Object.keys(permakController)); // Debug

// Basic routes
router.get("/", permakController.index);
router.get("/kategori/:id", permakController.detailKategori);
router.get("/jenis/:id", permakController.detailJenisPermak);
router.get("/search", permakController.search);

// Handle file upload and form submission
router.post(
  "/add-to-cart/:id",
  handleUploadPermak,
  permakController.addToCart // Pastikan method ini ada di controller
);

module.exports = router;
