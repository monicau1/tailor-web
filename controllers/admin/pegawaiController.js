// controllers/admin/pegawaiController.js
const { Pegawai } = require("../../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Controller untuk menampilkan form tambah pegawai (GET)
exports.showCreateForm = async (req, res) => {
  try {
    // Render form dengan layout.ejs dan include data
    res.render("admin/pegawai/pegawai-tambah", {
      layout: "admin/partials/layout",
      title: "Tambah Pegawai",
      path: req.originalUrl,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/pegawai?error=" +
        encodeURIComponent("Gagal memuat form tambah pegawai")
    );
  }
};

exports.createPegawai = async (req, res) => {
  try {
    // Cek role dari session
    if (req.session.adminRole !== "pemilik") {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses untuk menambah pegawai",
      });
    }

    const {
      nama_pegawai,
      username,
      email_pegawai,
      password_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai,
      role = "pegawai", // Default role
    } = req.body;

    // Validasi input
    if (
      !nama_pegawai ||
      !username ||
      !email_pegawai ||
      !password_pegawai ||
      !nomor_telepon_pegawai ||
      !tanggal_masuk_pegawai
    ) {
      return res.status(400).json({
        status: "error",
        message: "Semua field harus diisi",
      });
    }

    // Validasi panjang password
    if (password_pegawai.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pegawai)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    // Validasi format nomor telepon
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (!phoneRegex.test(nomor_telepon_pegawai)) {
      return res.status(400).json({
        status: "error",
        message: "Format nomor telepon tidak valid",
      });
    }

    // Cek username unik
    const existingUsername = await Pegawai.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({
        status: "error",
        message: "Username sudah digunakan",
      });
    }

    // Cek email unik
    const existingEmail = await Pegawai.findOne({
      where: { email_pegawai },
    });

    if (existingEmail) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password_pegawai, 10);

    // Simpan data pegawai baru
    const pegawai = await Pegawai.create({
      nama_pegawai,
      username,
      email_pegawai,
      password_pegawai: hashedPassword,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai: new Date(tanggal_masuk_pegawai),
      role,
    });

    res.status(201).json({
      status: "success",
      message: "Data pegawai berhasil ditambahkan",
      data: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat menambah pegawai",
    });
  }
};

// Mendapatkan semua data pegawai dengan paginasi dan pencarian
exports.getAllPegawai = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { nama_pegawai: { [Op.like]: `%${search}%` } },
          { email_pegawai: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Hitung total data
    const totalItems = await Pegawai.count({ where: whereClause });

    // Ambil data pegawai
    const pegawai = await Pegawai.findAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["id_pegawai", "DESC"]],
    });

    console.log("Data pegawai:", pegawai);

    // Render halaman dengan data
    res.render("admin/pegawai/pegawai", {
      layout: "admin/partials/layout",
      title: "Daftar Pegawai",
      path: req.originalUrl,
      pegawaiList: pegawai,
      user: {
        role: req.session.adminRole,
      },
      canCreatePegawai: req.session.adminRole === "pemilik", // Tambahkan ini
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
      query: {
        search: search,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("admin/error", {
      layout: "admin/partials/layout",
      message: "Terjadi kesalahan saat memuat data pegawai",
    });
  }
};

// Get pegawai by ID
exports.getPegawaiById = async (req, res) => {
  try {
    const { id } = req.params;

    const pegawai = await Pegawai.findByPk(id);

    if (!pegawai) {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(404).json({
          status: "error",
          message: "Pegawai tidak ditemukan",
        });
      }
      return res.redirect(
        "/admin/pegawai?error=" + encodeURIComponent("Pegawai tidak ditemukan")
      );
    }

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: pegawai,
      });
    }

    res.render("admin/pegawai/pegawai-edit", {
      layout: "admin/partials/layout",
      title: "Edit Pegawai",
      path: req.originalUrl,
      pegawai: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    res.redirect("/admin/pegawai?error=" + encodeURIComponent(error.message));
  }
};

// Update pegawai
exports.updatePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_pegawai,
      email_pegawai,
      password_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai,
    } = req.body;

    // Validasi input
    if (
      !nama_pegawai ||
      !email_pegawai ||
      !nomor_telepon_pegawai ||
      !tanggal_masuk_pegawai
    ) {
      return res.status(400).json({
        status: "error",
        message: "Semua field harus diisi",
      });
    }

    // Validasi panjang password jika ada
    if (password_pegawai && password_pegawai.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pegawai)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    // Cek apakah pegawai ada
    const pegawai = await Pegawai.findByPk(id);
    if (!pegawai) {
      return res.status(404).json({
        status: "error",
        message: "Pegawai tidak ditemukan",
      });
    }

    // Cek apakah email sudah digunakan oleh pegawai lain
    const existingPegawai = await Pegawai.findOne({
      where: {
        email_pegawai,
        id_pegawai: { [Op.ne]: id },
      },
    });

    if (existingPegawai) {
      return res.status(400).json({
        status: "error",
        message: "Email pegawai sudah digunakan",
      });
    }

    // Siapkan data update
    const updateData = {
      nama_pegawai,
      email_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai: new Date(tanggal_masuk_pegawai),
    };

    // Tambahkan password ke data update jika ada
    if (password_pegawai) {
      updateData.password_pegawai = password_pegawai;
    }

    // Update data pegawai
    await pegawai.update(updateData);

    res.json({
      status: "success",
      message: "Data pegawai berhasil diperbarui",
      data: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete pegawai
exports.deletePegawai = async (req, res) => {
  try {
    console.log("Mencoba menghapus pegawai:", req.params.id);
    console.log("Role admin:", req.session.adminRole);

    // Hanya pemilik yang bisa hapus
    if (req.session.adminRole !== "pemilik") {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses untuk menghapus pegawai",
      });
    }

    const { id } = req.params;

    const pegawai = await Pegawai.findByPk(id);
    if (!pegawai) {
      return res.status(404).json({
        status: "error",
        message: "Pegawai tidak ditemukan",
      });
    }

    await pegawai.destroy();
    console.log("Pegawai berhasil dihapus");

    res.json({
      status: "success",
      message: "Pegawai berhasil dihapus",
    });
  } catch (error) {
    console.error("Error menghapus pegawai:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat menghapus pegawai",
    });
  }
};
