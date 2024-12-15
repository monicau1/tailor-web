// controllers/customer/layanan/permakController.js
const {
  KategoriPermak,
  JenisPermak,
  InstruksiKhususPermak,
  Keranjang,
  KeranjangPermak,
  ItemKeranjangPermak,
} = require("../../../models");
const { Op } = require("sequelize");
const fs = require("fs");
const sequelize = require("../../../utils/db.js");
const path = require("path");

// Get semua kategori permak untuk halaman index
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // Hitung total kategori untuk pagination
    const { count, rows: kategoriPermak } =
      await KategoriPermak.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: JenisPermak,
            as: "JenisPermak",
            attributes: ["id_jenis_permak"],
          },
        ],
        order: [["nama_kategori_permak", "ASC"]],
      });

    const totalPages = Math.ceil(count / limit);

    res.render("customer/pages/layanan/permak/index", {
      title: "Kategori Layanan Permak",
      kategoriPermak,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("customer/pages/error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat halaman",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Get detail kategori permak berdasarkan ID
exports.detailKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_item_keranjang } = req.query;

    const kategori = await KategoriPermak.findOne({
      where: { id_kategori_permak: id },
      include: [
        {
          model: JenisPermak,
          as: "JenisPermak",
          where: { status_produk: "active" },
          required: false,
        },
      ],
    });

    if (!kategori) {
      return res.status(404).render("pages/404", {
        title: "404 - Kategori Tidak Ditemukan",
      });
    }

    res.render("customer/pages/layanan/permak/detail", {
      title: `Kategori ${kategori.nama_kategori_permak}`,
      kategori,
      id_item_keranjang,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat halaman",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

exports.detailJenisPermak = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_keranjang_permak } = req.query; // Ambil dari query params

    // Dapatkan detail jenis permak
    const jenisPermak = await JenisPermak.findOne({
      where: {
        id_jenis_permak: id,
        status_produk: "active",
      },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
        },
      ],
    });

    if (!jenisPermak) {
      return res.status(404).render("pages/404", {
        title: "404 - Jenis Permak Tidak Ditemukan",
      });
    }

    // Ambil existing items dari session bukan database
    let existingItems = [];
    if (req.session.userId && req.session.cart?.permak) {
      existingItems = req.session.cart.permak.map((item) => ({
        id_keranjang_permak: item.id_keranjang_permak,
        deskripsi_pakaian: item.deskripsi_pakaian,
        DetailPermak: [
          {
            JenisPermak: {
              nama_permak: item.nama_permak,
            },
          },
        ],
      }));
    }

    res.render("customer/pages/layanan/permak/jenis-detail", {
      title: jenisPermak.nama_permak,
      jenisPermak,
      existingItems,
      selectedKeranjangPermak: id_keranjang_permak || null, // Gunakan nilai dari query
      formData: req.flash("formData")[0] || {},
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat halaman",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id } = req.params; // id_jenis_permak
    const { id_keranjang_permak } = req.query;
    const {
      deskripsi_pakaian,
      catatan_perubahan,
      lokasi_perbaikan,
      deskripsi_perbaikan,
      catatan_tambahan,
    } = req.body;

    // Cek login
    if (!req.session.userId) {
      if (req.file) fs.unlinkSync(req.file.path);
      req.flash("error", "Silakan login terlebih dahulu");
      return res.redirect("/auth/login");
    }

    // Cek jenis permak
    const jenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: id },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
        },
      ],
    });

    if (!jenisPermak) {
      if (req.file) fs.unlinkSync(req.file.path);
      req.flash("error", "Jenis permak tidak ditemukan");
      return res.redirect("back");
    }

    // Handle file upload
    let gambarPermak = null;
    if (req.file) {
      gambarPermak = req.file.filename;
    }

    // Inisialisasi keranjang jika belum ada
    if (!req.session.cart) {
      req.session.cart = { pakaian: [], permak: [] };
    }

    // Jika menambahkan ke item yang sudah ada
    if (id_keranjang_permak) {
      const existingItem = req.session.cart.permak.find(
        (item) => item.id_keranjang_permak.toString() === id_keranjang_permak
      );

      if (existingItem) {
        if (!existingItem.DetailPermak) {
          existingItem.DetailPermak = [];
        }

        existingItem.DetailPermak.push({
          id_jenis_permak: jenisPermak.id_jenis_permak,
          JenisPermak: {
            nama_permak: jenisPermak.nama_permak,
            tipe_permak: jenisPermak.tipe_permak,
          },
          InstruksiPermak: {
            catatan_perubahan,
            lokasi_perbaikan,
            deskripsi_perbaikan,
            catatan_tambahan,
          },
          harga_per_item: jenisPermak.harga,
          kuantitas: 1,
        });

        req.flash(
          "success",
          "Jenis permak berhasil ditambahkan ke pakaian yang dipilih"
        );
        return res.redirect("/cart");
      }
    }

    // Tambah item baru
    req.session.cart.permak.push({
      id_keranjang_permak: Date.now(), // Generate unique ID
      id_kategori_permak: jenisPermak.id_kategori_permak,
      kategori_permak: jenisPermak.KategoriPermak.nama_kategori_permak,
      deskripsi_pakaian,
      gambar_permak: gambarPermak,
      DetailPermak: [
        {
          id_jenis_permak: jenisPermak.id_jenis_permak,
          JenisPermak: {
            nama_permak: jenisPermak.nama_permak,
            tipe_permak: jenisPermak.tipe_permak,
          },
          InstruksiPermak: {
            catatan_perubahan,
            lokasi_perbaikan,
            deskripsi_perbaikan,
            catatan_tambahan,
          },
          harga_per_item: jenisPermak.harga,
          kuantitas: 1,
        },
      ],
    });

    req.flash("success", "Berhasil menambahkan ke keranjang");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    req.flash("error", "Gagal menambahkan ke keranjang");
    res.redirect("back");
  }
};

// Search jenis permak
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const searchResults = await JenisPermak.findAll({
      where: {
        nama_permak: {
          [Op.like]: `%${q}%`,
        },
        status_produk: "active",
      },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
        },
      ],
    });

    res.render("customer/pages/layanan/permak/search", {
      title: "Hasil Pencarian",
      searchQuery: q,
      results: searchResults,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Terjadi kesalahan saat mencari",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

exports.showExistingItems = async (req, res) => {
  try {
    const keranjang = await Keranjang.findOne({
      where: {
        id_pelanggan: req.session.userId,
        jenis_layanan: "permak",
      },
      include: [
        {
          model: KeranjangPermak,
          as: "KeranjangPermak",
          include: [
            {
              model: KategoriPermak,
              as: "KategoriPermak",
            },
            {
              model: ItemKeranjangPermak, // Ganti nama model
              as: "DetailPermak",
              separate: true,
              include: [
                {
                  model: JenisPermak,
                  as: "JenisPermak",
                },
                {
                  model: InstruksiKhususPermak, // Pastikan relasi ini didefinisikan di model
                  as: "InstruksiKhusus", // Sesuaikan dengan alias di model
                  foreignKey: "id_instruksi_permak", // Sesuaikan dengan nama kolom di database
                },
              ],
            },
          ],
        },
      ],
    });

    // Sisa kode sama
  } catch (error) {
    console.error("Error detail:", error);
    req.flash("error", "Terjadi kesalahan saat memuat data");
    res.redirect("back");
  }
};
