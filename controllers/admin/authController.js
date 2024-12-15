// controllers/admin/authController.js
const bcrypt = require("bcrypt");
const { Pegawai } = require("../../models");
const { Op } = require("sequelize");

// Middleware untuk cek auth dan inject admin data
exports.injectAdminData = (req, res, next) => {
  res.locals.adminName = req.session?.adminName || "Admin";
  res.locals.adminRole = req.session?.adminRole || "pegawai";
  next();
};

exports.showLoginForm = (req, res) => {
  if (req.session.adminId) {
    return res.redirect("/admin/dashboard");
  }

  res.render("admin/auth/login", {
    layout: "admin/partials/auth-layout",
    title: "Login Admin",
    messages: req.flash(),
  });
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Cari pegawai berdasarkan email atau username
    const pegawai = await Pegawai.findOne({
      where: {
        [Op.or]: [{ email_pegawai: identifier }, { username: identifier }],
      },
    });

    if (!pegawai) {
      return res.status(401).json({
        status: "error",
        message: "Email/Username atau password salah",
      });
    }

    // Cek password
    let isValidPassword;
    if (pegawai.password_pegawai.startsWith("$2")) {
      isValidPassword = bcrypt.compareSync(password, pegawai.password_pegawai);
    } else {
      isValidPassword = password === pegawai.password_pegawai;

      // Hash password plain text
      if (isValidPassword) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await pegawai.update({ password_pegawai: hashedPassword });
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Email/Username atau password salah",
      });
    }

    // Set session
    req.session.adminId = pegawai.id_pegawai;
    req.session.adminName = pegawai.nama_pegawai;
    req.session.adminRole = pegawai.role;

    res.json({
      status: "success",
      message: "Login berhasil",
      redirectUrl: "/admin/dashboard",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan saat logout",
      });
    }
    res.redirect("/admin/login");
  });
};
