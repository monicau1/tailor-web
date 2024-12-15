// routes/admin/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/authController");

// Gunakan middleware untuk semua route
router.use(authController.injectAdminData);

router.get("/login", authController.showLoginForm);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
