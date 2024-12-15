// routes/admin/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboardController");

router.get("/", dashboardController.getDashboard);
router.get("/tren-pendapatan", dashboardController.getTrenPendapatan);
router.get(
  "/total-pendapatan",
  dashboardController.getTotalPendapatanByPeriode
);

module.exports = router;
