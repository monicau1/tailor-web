// routes/customer/checkoutRoutes.js (ini adalah controller pada website pelanggan bukan admin)
const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/customer/checkoutController");
const { isAuthenticated } = require("../../middleware/customer/authMiddleware");

// Routes untuk checkout permak
router.get("/permak", isAuthenticated, checkoutController.showPermakCheckout);
router.post(
  "/permak",
  isAuthenticated,
  checkoutController.processPermakCheckout
);

// routes/checkoutRoutes.js
router.get("/jahit", isAuthenticated, checkoutController.showJahitCheckout);
router.post("/jahit", isAuthenticated, checkoutController.processJahitCheckout);

// Halaman konfirmasi setelah checkout berhasil
router.get(
  "/success/:orderId",
  isAuthenticated,
  checkoutController.showSuccess
);

module.exports = router;
