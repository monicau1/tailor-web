const express = require("express");
const router = express.Router();

// Import middleware
const authMiddleware = require("../../middleware/customer/authMiddleware");
const cartMiddleware = require("../../middleware/customer/cartMiddleware");

// Import routes
const authRoutes = require("./authRoutes");
const contactRoutes = require("./contactRoutes");
const permakRoutes = require("./layanan/permakRoutes");
const pakaianRoutes = require("./layanan/pakaianRoutes");
const keranjangRoutes = require("./keranjangRoutes");
const checkoutRoutes = require("./checkoutRoutes");
const profileRoutes = require("./profileRoutes");
const orderRoutes = require("./orderRoutes");
const shippingRoutes = require("./shippingRoutes");

// Middleware untuk semua routes
router.use(cartMiddleware.cartItemCount);

// Public routes
router.use("/auth", authRoutes);
router.use("/contact", contactRoutes);
router.use("/permak", permakRoutes);
router.use("/pakaian", pakaianRoutes);
router.use("/shipping", shippingRoutes);

// Protected routes (perlu login)
router.use("/cart", authMiddleware.isAuthenticated, keranjangRoutes);
router.use("/checkout", authMiddleware.isAuthenticated, checkoutRoutes);
router.use("/profile", authMiddleware.isAuthenticated, profileRoutes);
router.use("/orders", authMiddleware.isAuthenticated, orderRoutes);

// Home page
router.get("/", (req, res) => {
  res.render("customer/pages/home", {
    title: "Home",
    path: "/",
  });
});

module.exports = router;
