// controllers/customer/layanan/pakaianController.js
const {
  KategoriPakaian,
  Pakaian,
  GambarPakaian,
  VarianPakaian,
  Keranjang,
  KeranjangPakaian,
} = require("../../../models");
const { Op } = require("sequelize");
const sequelize = require("../../../utils/db.js");

// Di controllers/layanan/pakaianController.js
exports.index = async (req, res) => {
  try {
    // TARUH CONSOLE LOG DI SINI (Awal fungsi)
    console.log("=== DEBUG INFO ===");
    console.log("Query params:", req.query);
    console.log("=================");
    console.log("Query params:", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // Ambil kategori yang memiliki pakaian aktif saja
    const kategoriPakaian = await KategoriPakaian.findAll({
      include: [
        {
          model: Pakaian,
          as: "Pakaian",
          where: { status_produk: "active" },
          attributes: [],
          required: true,
        },
      ],
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // TARUH CONSOLE LOG DI SINI (Setelah ambil kategori)
    console.log("=== KATEGORI INFO ===");
    console.log("Kategori Pakaian:", kategoriPakaian);
    console.log("====================");

    const selectedKategori = req.query.kategori
      ? parseInt(req.query.kategori)
      : null;

    // Buat kondisi where untuk filter pakaian
    let whereClause = {
      status_produk: "active",
    };

    // Tambahkan filter berdasarkan kategori jika ada
    if (selectedKategori) {
      whereClause.id_kategori_pakaian = selectedKategori;
    }

    console.log("=== SELECTED INFO ===");
    console.log("Selected Kategori:", selectedKategori);
    console.log("====================");

    // Query untuk mengambil pakaian dengan filter
    const { count, rows: pakaianList } = await Pakaian.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: GambarPakaian,
          as: "GambarPakaian",
          attributes: ["nama_file", "is_primary"],
          required: false,
        },
        {
          model: VarianPakaian,
          as: "VarianPakaian",
          attributes: ["ukuran", "warna"],
          required: false,
        },
        {
          model: KategoriPakaian,
          as: "KategoriPakaian",
          required: false,
        },
      ],
      distinct: true,
      limit,
      offset,
    });

    // Ambil info kategori yang dipilih untuk judul
    let kategoriInfo = null;
    if (selectedKategori) {
      kategoriInfo = await KategoriPakaian.findByPk(selectedKategori);
    }

    const totalPages = Math.ceil(count / limit);

    res.render("customer/pages/layanan/pakaian/index", {
      title: "Katalog Pakaian",
      kategoriPakaian,
      pakaianList,
      currentPage: page,
      totalPages,
      selectedKategori,
      kategoriInfo,
      query: req.query,
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

// Get detail pakaian berdasarkan ID
exports.detailPakaian = async (req, res) => {
  try {
    const { id } = req.params;

    // Query untuk mengambil data pakaian beserta relasinya
    const pakaian = await Pakaian.findOne({
      where: {
        id_pakaian: id,
        status_produk: "active",
      },
      include: [
        {
          model: KategoriPakaian,
          as: "KategoriPakaian",
        },
        {
          model: GambarPakaian,
          as: "GambarPakaian",
          attributes: ["nama_file", "is_primary"],
        },
        {
          model: VarianPakaian,
          as: "VarianPakaian",
        },
      ],
    });

    if (!pakaian) {
      console.log("Pakaian not found");
      return res.status(404).render("pages/404", {
        title: "404 - Pakaian Tidak Ditemukan",
      });
    }

    // Siapkan data gambar
    const gambarUtama = pakaian.GambarPakaian.find(
      (g) => g.is_primary
    )?.nama_file;
    const gambarLain = pakaian.GambarPakaian.filter((g) => !g.is_primary).map(
      (g) => g.nama_file
    );

    // Render halaman detail
    res.render("customer/pages/layanan/pakaian/detail", {
      title: pakaian.nama_pakaian,
      pakaian: pakaian,
      gambarUtama,
      gambarLain,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error in detailPakaian:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat halaman",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Search pakaian
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // Get all categories for sidebar
    const kategoriPakaian = await KategoriPakaian.findAll({
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // Search query
    const { count, rows: pakaianList } = await Pakaian.findAndCountAll({
      where: {
        [Op.or]: [
          {
            nama_pakaian: {
              [Op.like]: `%${q}%`,
            },
          },
          {
            deskripsi_pakaian: {
              [Op.like]: `%${q}%`,
            },
          },
        ],
        status_produk: "active",
      },
      include: [
        {
          model: GambarPakaian,
          as: "GambarPakaian",
          where: { is_primary: true },
          required: false,
        },
        {
          model: VarianPakaian,
          as: "VarianPakaian",
        },
        {
          model: KategoriPakaian,
          as: "KategoriPakaian",
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);
    // Debug log untuk melihat hasil query
    console.log("Total pakaian found:", count);
    console.log(
      "Sample pakaian:",
      pakaianList.map((p) => ({
        id: p.id_pakaian,
        nama: p.nama_pakaian,
        kategori_id: p.id_kategori_pakaian,
      }))
    );

    res.render("customer/pages/layanan/pakaian/index", {
      title: `Hasil Pencarian: ${q}`,
      kategoriPakaian,
      pakaianList,
      currentPage: page,
      totalPages,
      searchQuery: q,
      selectedKategori: null,
      kategoriInfo: null,
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

exports.checkStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { ukuran, warna } = req.query;

    // Cari varian yang sesuai
    const varian = await VarianPakaian.findOne({
      where: {
        id_pakaian: id,
        ukuran: ukuran,
        warna: warna,
      },
    });

    // Kirim response
    res.json({
      stok: varian ? varian.stok : 0,
    });
  } catch (error) {
    console.error("Error checking stock:", error);
    res.status(500).json({
      error: "Gagal mengecek stok",
      stok: 0,
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { ukuran, warna, quantity = 1, catatan } = req.body;

    if (!req.session.userId) {
      req.flash("error", "Silakan login terlebih dahulu");
      return res.redirect("/auth/login");
    }

    // Cek varian di database
    const varian = await VarianPakaian.findOne({
      where: {
        id_pakaian: id,
        ukuran: ukuran,
        warna: warna,
      },
      include: [
        {
          model: Pakaian,
          as: "Pakaian",
          include: [
            {
              model: GambarPakaian,
              as: "GambarPakaian",
              where: { is_primary: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!varian) {
      req.flash("error", "Varian pakaian tidak ditemukan");
      return res.redirect("back");
    }

    // Cek stok
    if (varian.stok < quantity) {
      req.flash("error", "Stok tidak mencukupi");
      return res.redirect("back");
    }

    // Inisialisasi keranjang jika belum ada
    if (!req.session.cart) {
      req.session.cart = { pakaian: [], permak: [] };
    }

    // Cek apakah varian sudah ada di keranjang
    const existingItem = req.session.cart.pakaian.find(
      (item) => item.id_varian_pakaian === varian.id_varian_pakaian
    );

    if (existingItem) {
      // Jika total quantity melebihi stok
      if (existingItem.kuantitas + parseInt(quantity) > varian.stok) {
        req.flash("error", "Total pesanan melebihi stok yang tersedia");
        return res.redirect("back");
      }
      // Update quantity jika item sudah ada
      existingItem.kuantitas += parseInt(quantity);
    } else {
      // Tambah item baru
      req.session.cart.pakaian.push({
        id_varian_pakaian: varian.id_varian_pakaian,
        id_pakaian: varian.id_pakaian,
        nama_pakaian: varian.Pakaian.nama_pakaian,
        harga_per_item: varian.Pakaian.harga,
        ukuran: varian.ukuran,
        warna: varian.warna,
        kuantitas: parseInt(quantity),
        catatan: catatan || null,
        gambar: varian.Pakaian.GambarPakaian?.[0]?.nama_file || null,
        stok_tersedia: varian.stok,
      });
    }

    req.flash("success", "Berhasil menambahkan ke keranjang");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menambahkan ke keranjang");
    res.redirect("back");
  }
};

// Di pakaianController.js
exports.detailKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // Ambil semua kategori untuk sidebar
    const kategoriPakaian = await KategoriPakaian.findAll({
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // Ambil info kategori yang dipilih
    const kategoriInfo = await KategoriPakaian.findByPk(id);

    if (!kategoriInfo) {
      req.flash("error", "Kategori tidak ditemukan");
      return res.redirect("/pakaian");
    }

    // Ambil pakaian dalam kategori ini
    const { count, rows: pakaianList } = await Pakaian.findAndCountAll({
      where: {
        id_kategori_pakaian: id,
        status_produk: "active",
      },
      include: [
        {
          model: GambarPakaian,
          as: "GambarPakaian",
          attributes: ["nama_file", "is_primary"],
          required: false,
        },
        {
          model: VarianPakaian,
          as: "VarianPakaian",
          attributes: ["ukuran", "warna"],
          required: false,
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    // Render template index.ejs yang sudah ada
    res.render("customer/pages/layanan/pakaian/index", {
      title: `Kategori ${kategoriInfo.nama_kategori_pakaian}`,
      kategoriPakaian,
      pakaianList,
      currentPage: page,
      totalPages,
      selectedKategori: parseInt(id),
      kategoriInfo,
      query: req.query,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat kategori");
    res.redirect("/pakaian");
  }
};
