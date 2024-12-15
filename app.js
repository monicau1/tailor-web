const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const sequelize = require("./utils/db.js");
const { UPLOAD_PATHS, createUploadDirectories } = require("./shared/config");
const formatHelper = require("./shared/helpers/formatHelper");
const statusHelper = require("./shared/helpers/statusHelper");

// Load environment variables
require("dotenv").config();

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection test successful");
    console.log("Using database:", process.env.DB_NAME);
  })
  .catch((err) => {
    console.error("Database connection test failed:", err);
  });

const app = express();

// Buat direktori upload
createUploadDirectories();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Session middleware
app.use(
  session({
    name: "customerSession",
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Flash middleware - harus setelah session
app.use(flash());

// View engine setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set locals middleware
app.use((req, res, next) => {
  res.locals = {
    ...res.locals,
    messages: req.flash(),
    path: req.originalUrl,
    isAuthenticated: !!req.session.userId,
    user: {
      name: req.session?.userName || null,
      id: req.session?.userId || null,
    },
  };
  next();
});

// Setup helper functions untuk view
app.locals = {
  ...app.locals,
  formatNumber: formatHelper.formatNumber,
  formatDate: formatHelper.formatDate,
  formatDateTime: formatHelper.formatDateTime,
  formatTime: formatHelper.formatTime,
  formatStatus: formatHelper.formatStatus,
  getStatusColor: statusHelper.getStatusColor,
  getStatusDisplay: statusHelper.getStatusDisplay,
  STATUS_PESANAN: statusHelper.STATUS_PESANAN,
};

// Static files setup
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/uploads/admin/produk-pakaian",
  express.static(UPLOAD_PATHS.ADMIN.PRODUK)
);
app.use(
  "/uploads/admin/kategori-permak",
  express.static(UPLOAD_PATHS.ADMIN.KATEGORI_PERMAK)
);
app.use(
  "/uploads/pelanggan/pembayaran",
  express.static(UPLOAD_PATHS.PELANGGAN.PEMBAYARAN)
);
app.use(
  "/uploads/pelanggan/pesanan/permak",
  express.static(UPLOAD_PATHS.PELANGGAN.PERMAK)
);

// Import routes
const adminRoutes = require("./routes/admin");
const customerRoutes = require("./routes/customer");

// Admin routes dengan sessionnya sendiri
app.use(
  "/admin",
  session({
    name: "adminSession",
    secret: process.env.ADMIN_SESSION_SECRET || "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
  (req, res, next) => {
    app.set("layout", "admin/partials/layout");
    res.locals.adminName = req.session?.adminName;
    res.locals.adminRole = req.session?.adminRole;
    next();
  },
  adminRoutes
);

// Customer routes
app.use(
  "/",
  (req, res, next) => {
    app.set("layout", "customer/layouts/layout");
    next();
  },
  customerRoutes
);

// Home route
app.get("/", (req, res) => {
  res.render("customer/pages/home", {
    title: "Home",
    layout: "customer/layouts/layout",
  });
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .render(
      req.path.startsWith("/admin") ? "admin/404" : "customer/pages/404",
      {
        title: "Page Not Found",
        layout: req.path.startsWith("/admin")
          ? "admin/partials/layout"
          : "customer/layouts/layout",
      }
    );
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }

  res
    .status(500)
    .render(
      req.path.startsWith("/admin") ? "admin/error" : "customer/pages/error",
      {
        title: "Error",
        message: "Terjadi kesalahan pada server!",
        error: process.env.NODE_ENV === "development" ? err : {},
        layout: req.path.startsWith("/admin")
          ? "admin/partials/layout"
          : "customer/layouts/layout",
      }
    );
});

// Start server
// Start server
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    const IP = process.env.IP || "0.0.0.0"; // Tambahkan fallback IP

    app
      .listen(PORT, IP, () => {
        console.log(`Server is running on ${IP}:${PORT}`);
        console.log("Database synced successfully");
      })
      .on("error", (err) => {
        console.error("Failed to start server:", err);
        process.exit(1); // Exit dengan error code
      });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit dengan error code
  });

module.exports = app;
