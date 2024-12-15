// routes/customer/contactRoutes.js
const express = require("express");
const router = express.Router();

// GET /contact - Menampilkan halaman contact
router.get("/", (req, res) => {
  res.render("customer/pages/contact", {
    // Ubah dari pages/contact
    title: "Hubungi Kami",
    layout: "customer/layouts/layout",
  });
});

// POST /contact/send - Memproses form contact
router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validasi input
    if (!name || !email || !subject || !message) {
      req.flash("error", "Semua field harus diisi");
      return res.redirect("/contact");
    }

    // Di sini Anda bisa menambahkan logika untuk:
    // 1. Menyimpan pesan ke database
    // 2. Mengirim email notifikasi
    // 3. Dll

    req.flash(
      "success",
      "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda."
    );
    res.redirect("/contact");
  } catch (error) {
    console.error("Error in contact form:", error);
    req.flash("error", "Terjadi kesalahan. Silakan coba lagi.");
    res.redirect("/contact");
  }
});

module.exports = router;
