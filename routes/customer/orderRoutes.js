// routes/customer/orderRoutes.js (ini adalah controller pada website pelanggan bukan admin)

const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/customer/orderController");
const { isAuthenticated } = require("../../middleware/customer/authMiddleware");
const {
  handleUploadPembayaran,
} = require("../../middleware/customer/uploadMiddleware");

// Rute dasar - daftar pesanan
router.get("/", isAuthenticated, orderController.listOrders);

// Rute untuk detail pesanan spesifik (harus diletakkan sebelum rute generic /:id)
router.get("/:id/permak", isAuthenticated, orderController.orderDetailPermak);
router.get("/:id/jahit", isAuthenticated, orderController.orderDetailJahit);

// Rute untuk pembayaran
router.get(
  "/:id/upload-payment",
  isAuthenticated,
  orderController.showUploadPayment
);
router.post(
  "/:id/upload-payment",
  isAuthenticated,
  handleUploadPembayaran,
  orderController.processUploadPayment
);

// Rute untuk label pesanan
router.get("/:id/label", isAuthenticated, orderController.previewLabel);

// Rute generic detail pesanan (pindahkan ke paling bawah)
// Ini akan bertindak sebagai fallback dan redirect ke rute yang sesuai
router.get("/:id/:type", orderController.orderDetail);
router.get("/:id", isAuthenticated, orderController.orderDetail);

module.exports = router;
