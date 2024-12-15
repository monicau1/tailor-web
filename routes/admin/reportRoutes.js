// routes/admin/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/admin/reportController");
const authMiddleware = require("../../middleware/admin/authMiddleware");

router.get("/pembayaran", authMiddleware, reportController.getPaymentReport);
router.get(
  "/pembayaran/export",
  authMiddleware,
  reportController.exportPaymentReport
);

module.exports = router;
