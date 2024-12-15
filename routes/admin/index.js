const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authMiddleware");

// Import routes
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const pakaianRoutes = require("./pakaianRoutes");
const kategoriPakaianRoutes = require("./kategoriPakaianRoutes");
const kategoriPermakRoutes = require("./kategoriPermakRoutes");
const jenisPermakRoutes = require("./jenisPermakRoutes");
const pegawaiRoutes = require("./pegawaiRoutes");
const pelangganRoutes = require("./pelangganRoutes");
const pesananRoutes = require("./pesananRoutes");
const reportRoutes = require("./reportRoutes");

// Auth routes (tidak perlu middleware auth)
router.use("/", authRoutes);

// Protected routes (perlu login)
router.use("/dashboard", authMiddleware, dashboardRoutes);
router.use("/pakaian", authMiddleware, pakaianRoutes);
router.use("/kategori/pakaian", authMiddleware, kategoriPakaianRoutes);
router.use("/kategori/permak", authMiddleware, kategoriPermakRoutes);
router.use("/permak", authMiddleware, jenisPermakRoutes);
router.use("/pegawai", authMiddleware, pegawaiRoutes);
router.use("/pelanggan", authMiddleware, pelangganRoutes);
router.use("/pesanan", authMiddleware, pesananRoutes);
router.use("/laporan", authMiddleware, reportRoutes);

// Default admin route
router.get("/", authMiddleware, (req, res) => {
  res.redirect("/admin/dashboard");
});

module.exports = router;
