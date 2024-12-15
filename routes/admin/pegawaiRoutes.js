// routes/admin/pegawaiRoutes.js
const express = require("express");
const router = express.Router();
const pegawaiController = require("../../controllers/admin/pegawaiController");

// Route untuk menampilkan daftar pegawai
router.get("/", pegawaiController.getAllPegawai);

router.get("/create", pegawaiController.showCreateForm);
router.post("/create", pegawaiController.createPegawai);

// Route untuk menampilkan form edit pegawai
router.get("/:id", pegawaiController.getPegawaiById);

// Route untuk memproses update pegawai
router.put("/:id", pegawaiController.updatePegawai);

// Route untuk menghapus pegawai
router.delete("/:id", pegawaiController.deletePegawai);

module.exports = router;
