// routes/customer/layanan/pakaianRoutes.js
const express = require("express");
const router = express.Router();
const pakaianController = require("../../../controllers/customer/layanan/pakaianController");

// Tambahkan log middleware untuk debugging
router.use((req, res, next) => {
  console.log("Pakaian Route accessed:", {
    path: req.path,
    query: req.query,
    method: req.method,
  });
  next();
});

// Halaman index kategori pakaian
router.get("/", pakaianController.index);

// Detail kategori pakaian
router.get("/kategori/:id", pakaianController.detailKategori);

// Detail pakaian
router.get("/detail/:id", pakaianController.detailPakaian);

// Tambah ke keranjang
router.post("/add-to-cart/:id", pakaianController.addToCart);

// Search
router.get("/search", pakaianController.search);

router.get("/check-stock/:id", pakaianController.checkStock);

module.exports = router;
