// middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
  // Cek apakah user sudah login
  if (!req.session.adminId) {
    req.flash("error", "Silakan login terlebih dahulu");
    return res.redirect("/admin/login");
  }
  next();
};

module.exports = authMiddleware;

// controllers/authController.js
const { Pegawai } = require("../../models");
const bcrypt = require("bcrypt");

exports.showLoginForm = (req, res) => {
  res.render("auth/login", {
    layout: "partials/auth-layout",
    title: "Login Admin",
    messages: req.flash(),
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      req.flash("error", "Email dan password harus diisi");
      return res.redirect("/admin/login");
    }

    // Cari pegawai berdasarkan email
    const pegawai = await Pegawai.findOne({
      where: { email_pegawai: email },
    });

    if (!pegawai) {
      req.flash("error", "Email atau password salah");
      return res.redirect("/admin/login");
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(
      password,
      pegawai.password_pegawai
    );
    if (!validPassword) {
      req.flash("error", "Email atau password salah");
      return res.redirect("/admin/login");
    }

    // Set session
    req.session.adminId = pegawai.id_pegawai;
    req.session.adminName = pegawai.nama_pegawai;

    // Redirect ke dashboard
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Terjadi kesalahan saat login");
    res.redirect("/admin/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/admin/login");
  });
};
