// routes/customer/keranjangController.js

const express = require("express");
const router = express.Router();
const keranjangController = require("../../controllers/customer/keranjangController");

router.get("/", keranjangController.index);
router.post("/update-quantity/:id", keranjangController.updateQuantity);

// Sesuaikan dengan form di EJS
router.delete("/delete/:type/:id", keranjangController.deleteItem);
router.delete(
  "/delete-jenis-permak/:id_keranjang_permak/:id_jenis_permak",
  keranjangController.deleteJenisPermak
);

module.exports = router;
