// controllers/customer/authController.js
const { Pelanggan } = require("../../models"); // Import model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../../utils/customer/emailConfig");

// Tampilkan halaman login
exports.loginPage = (req, res) => {
  res.render("customer/pages/auth/login", {
    title: "Login",
  });
};

// Tampilkan halaman register
exports.registerPage = (req, res) => {
  res.render("customer/pages/auth/register", {
    title: "Register",
  });
};

// Handle login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with:", { email });

    // Validasi input
    if (!email || !password) {
      req.flash("error", "Email dan password harus diisi");
      return res.redirect("/auth/login");
    }

    // Cari pelanggan berdasarkan email
    const pelanggan = await Pelanggan.findOne({
      where: { email_pelanggan: email },
    });
    console.log("Found customer:", pelanggan ? "Yes" : "No"); // Jangan log full object untuk keamanan

    // Jika pelanggan tidak ditemukan
    if (!pelanggan) {
      req.flash("error", "Email atau password salah");
      return res.redirect("/auth/login");
    }

    // Verifikasi password
    console.log("Verifying password...");
    const validPassword = await bcrypt.compare(
      password,
      pelanggan.password_pelanggan
    );
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      req.flash("error", "Email atau password salah");
      return res.redirect("/auth/login");
    }

    // Set session
    req.session.userId = pelanggan.id_pelanggan;
    req.session.userEmail = pelanggan.email_pelanggan;
    req.session.userName = pelanggan.nama_pelanggan;

    // Log session (hanya non-sensitive data)
    console.log("Session set:", {
      userId: req.session.userId,
      userEmail: req.session.userEmail,
    });

    req.flash("success", "Login berhasil");

    // Redirect ke halaman sebelumnya jika ada
    const redirectTo = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (error) {
    console.error("Login error detail:", error);
    req.flash("error", "Terjadi kesalahan saat login");
    res.redirect("/auth/login");
  }
};

// Handle register
exports.register = async (req, res) => {
  try {
    const { nama, email, password, nomor_telepon } = req.body;

    // Validasi input
    if (!nama || !email || !password || !nomor_telepon) {
      req.flash("error", "Semua field harus diisi");
      return res.redirect("/auth/register");
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Format email tidak valid");
      return res.redirect("/auth/register");
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await Pelanggan.findOne({
      where: { email_pelanggan: email },
    });

    if (existingUser) {
      req.flash("error", "Email sudah terdaftar");
      return res.redirect("/auth/register");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pelanggan baru
    await Pelanggan.create({
      nama_pelanggan: nama,
      email_pelanggan: email,
      password_pelanggan: hashedPassword,
      nomor_telepon_pelanggan: nomor_telepon,
      tanggal_registrasi_pelanggan: new Date(),
    });

    req.flash("success", "Registrasi berhasil, silakan login");
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Register error:", error);
    req.flash("error", "Terjadi kesalahan saat registrasi");
    res.redirect("/auth/register");
  }
};

// Handle logout
exports.logout = (req, res) => {
  try {
    // Hapus session
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        req.flash("error", "Terjadi kesalahan saat logout");
        return res.redirect("/");
      }
      res.redirect("/auth/login");
    });
  } catch (error) {
    console.error("Logout error:", error);
    req.flash("error", "Terjadi kesalahan saat logout");
    res.redirect("/");
  }
};

// Tambahkan fungsi baru ini
exports.forgotPasswordPage = (req, res) => {
  res.render("customer/pages/auth/forgot-password", {
    title: "Lupa Password",
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const pelanggan = await Pelanggan.findOne({
      where: { email_pelanggan: email },
    });

    if (!pelanggan) {
      req.flash("error", "Email tidak ditemukan");
      return res.redirect("/auth/forgot-password");
    }

    const token = jwt.sign(
      {
        id: pelanggan.id_pelanggan,
        email: pelanggan.email_pelanggan,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${token}`;

    // Kirim email
    const emailSent = await sendResetPasswordEmail(email, resetLink);

    if (!emailSent) {
      req.flash("error", "Gagal mengirim email reset password");
      return res.redirect("/auth/forgot-password");
    }

    req.flash("success", "Link reset password telah dikirim ke email anda");
    res.redirect("/auth/forgot-password");
  } catch (error) {
    console.error("Forgot password error:", error);
    req.flash("error", "Terjadi kesalahan saat memproses permintaan");
    res.redirect("/auth/forgot-password");
  }
};

exports.resetPasswordPage = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pelanggan = await Pelanggan.findByPk(decoded.id);

    if (!pelanggan) {
      req.flash("error", "Link reset password tidak valid");
      return res.redirect("customer/auth/login");
    }

    res.render("customer/pages/auth/reset-password", {
      title: "Reset Password",
      token: token,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      req.flash("error", "Link reset password sudah kadaluarsa");
    } else {
      req.flash("error", "Link reset password tidak valid");
    }
    res.redirect("/auth/login");
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password, confirm_password } = req.body;

  try {
    if (password !== confirm_password) {
      req.flash("error", "Password tidak cocok");
      return res.redirect(`/auth/reset-password/${token}`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pelanggan = await Pelanggan.findByPk(decoded.id);

    if (!pelanggan) {
      req.flash("error", "Link reset password tidak valid");
      return res.redirect("/auth/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pelanggan.update({ password_pelanggan: hashedPassword });

    req.flash("success", "Password berhasil diubah");
    res.redirect("/auth/login");
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      req.flash("error", "Link reset password sudah kadaluarsa");
    } else {
      console.error("Reset password error:", error);
      req.flash("error", "Terjadi kesalahan saat reset password");
    }
    res.redirect("/auth/login");
  }
};
