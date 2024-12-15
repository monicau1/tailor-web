// controllers/customer/keranjangController.js
const {
  Keranjang,
  KeranjangPakaian,
  KeranjangPermak,
  ItemKeranjangPermak,
  InstruksiKhususPermak,
  JenisPermak,
  KategoriPermak,
  VarianPakaian,
  Pakaian,
  GambarPakaian,
} = require("../../models");

const sequelize = require("../../utils/db.js");

// Helper functions
function initCart(session) {
  if (!session.cart) {
    session.cart = {
      pakaian: [],
      permak: [],
    };
  }
  return session.cart;
}

exports.index = async (req, res) => {
  try {
    const cart = initCart(req.session);

    // Format data permak
    const formattedPermak = cart.permak.map((item) => ({
      id_keranjang_permak: item.id_keranjang_permak,
      deskripsi_pakaian: item.deskripsi_pakaian,
      gambar_permak: item.gambar_permak,
      KategoriPermak: {
        id_kategori_permak: item.id_kategori_permak,
        nama_kategori_permak: item.kategori_permak,
      },
      DetailPermak: item.DetailPermak || [],
    }));

    // Format data jahit untuk mempertahankan struktur yang dibutuhkan view
    const formattedPakaian = cart.pakaian.map((item) => ({
      id_keranjang_pakaian: item.id_keranjang_pakaian,
      kuantitas: item.kuantitas,
      harga_per_item: item.harga_per_item,
      catatan: item.catatan,
      VarianPakaian: {
        ukuran: item.ukuran,
        warna: item.warna,
        stok: item.stok_tersedia,
        Pakaian: {
          nama_pakaian: item.nama_pakaian,
          GambarPakaian: item.gambar
            ? [
                {
                  nama_file: item.gambar,
                },
              ]
            : [],
        },
      },
    }));

    // Hitung total harga permak
    const totalHargaPermak = cart.permak.reduce((total, item) => {
      return (
        total +
        (item.DetailPermak || []).reduce((subTotal, detail) => {
          return subTotal + detail.harga_per_item * detail.kuantitas;
        }, 0)
      );
    }, 0);

    // Hitung total harga pakaian
    const totalHargaPakaian = cart.pakaian.reduce((total, item) => {
      return total + item.harga_per_item * item.kuantitas;
    }, 0);

    res.render("customer/pages/keranjang/index", {
      itemJahit: formattedPakaian,
      itemPermak: formattedPermak,
      totalHargaJahit: totalHargaPakaian,
      totalHargaPermak: totalHargaPermak,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat keranjang");
    res.redirect("/");
  }
};

exports.addPakaianToCart = async (req, res) => {
  try {
    const cart = initCart(req.session);
    const { id_varian_pakaian, kuantitas, catatan } = req.body;

    // Cek varian di database
    const varian = await VarianPakaian.findOne({
      where: { id_varian_pakaian },
      include: [
        {
          model: Pakaian,
          as: "Pakaian",
          include: ["GambarPakaian"],
        },
      ],
    });

    if (!varian) {
      req.flash("error", "Pakaian tidak ditemukan");
      return res.redirect("back");
    }

    // Cek stok
    if (varian.stok < kuantitas) {
      req.flash("error", "Stok tidak mencukupi");
      return res.redirect("back");
    }

    cart.pakaian.push({
      id_varian_pakaian,
      kuantitas: parseInt(kuantitas),
      harga_per_item: varian.Pakaian.harga,
      catatan,
      nama_pakaian: varian.Pakaian.nama_pakaian,
      ukuran: varian.ukuran,
      warna: varian.warna,
    });

    req.flash("success", "Berhasil ditambahkan ke keranjang");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menambahkan ke keranjang");
    res.redirect("back");
  }
};

exports.addPermakToCart = async (req, res) => {
  try {
    const cart = initCart(req.session);
    const { id_jenis_permak } = req.params;
    const { id_keranjang_permak } = req.query; // Tambahkan ini
    const {
      deskripsi_pakaian,
      catatan_perubahan,
      lokasi_perbaikan,
      deskripsi_perbaikan,
      catatan_tambahan,
    } = req.body;

    // Cek jenis permak
    const jenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak },
      include: [{ model: KategoriPermak, as: "KategoriPermak" }],
    });

    if (!jenisPermak) {
      req.flash("error", "Jenis permak tidak ditemukan");
      return res.redirect("back");
    }

    // Handle file upload jika ada
    let gambarPermak = null;
    if (req.file) {
      gambarPermak = req.file.filename;
    }

    // Jika menambahkan ke item yang sudah ada
    if (id_keranjang_permak) {
      const existingItem = cart.permak.find(
        (item) => item.id_keranjang_permak === parseInt(id_keranjang_permak)
      );

      if (existingItem) {
        // Tambahkan jenis permak baru ke DetailPermak yang sudah ada
        if (!existingItem.DetailPermak) existingItem.DetailPermak = [];

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

    console.log("File uploaded:", req.file);
    console.log("Gambar permak:", gambarPermak);

    // Tambah item baru
    cart.permak.push({
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

    req.flash("success", "Berhasil ditambahkan ke keranjang");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    req.flash("error", "Gagal menambahkan ke keranjang");
    res.redirect("back");
  }
};

// Di keranjangController.js, perbaiki fungsi deleteItem
exports.deleteItem = async (req, res) => {
  try {
    const cart = initCart(req.session);
    const { id, type } = req.params;

    if (type === "pakaian") {
      // Filter item pakaian
      cart.pakaian = cart.pakaian.filter(
        (item) => item.id_varian_pakaian !== parseInt(id)
      );
    } else if (type === "permak") {
      // Filter item permak berdasarkan id_keranjang_permak
      cart.permak = cart.permak.filter(
        (item) => item.id_keranjang_permak !== parseInt(id)
      );
    }

    req.flash("success", "Item berhasil dihapus");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus item");
    res.redirect("/cart");
  }
};

// Tambahkan fungsi untuk menghapus jenis permak spesifik
exports.deleteJenisPermak = async (req, res) => {
  try {
    const cart = initCart(req.session);
    const { id_keranjang_permak, id_jenis_permak } = req.params;

    // Cari item permak yang sesuai
    const permakItem = cart.permak.find(
      (item) => item.id_keranjang_permak === parseInt(id_keranjang_permak)
    );

    if (permakItem && permakItem.DetailPermak) {
      // Filter out jenis permak yang akan dihapus
      permakItem.DetailPermak = permakItem.DetailPermak.filter(
        (detail) => detail.id_jenis_permak !== parseInt(id_jenis_permak)
      );

      // Jika tidak ada lagi detail permak, hapus item permak tersebut
      if (permakItem.DetailPermak.length === 0) {
        cart.permak = cart.permak.filter(
          (item) => item.id_keranjang_permak !== parseInt(id_keranjang_permak)
        );
      }
    }

    req.flash("success", "Jenis permak berhasil dihapus");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus jenis permak");
    res.redirect("/cart");
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const cart = initCart(req.session); // Tambahkan ini
    const { id } = req.params;
    const { quantity } = req.body;

    // Validasi input
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Jumlah tidak valid",
      });
    }

    // Cari item di cart.pakaian
    const item = cart.pakaian.find(
      (item) => item.id_varian_pakaian === parseInt(id)
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item tidak ditemukan",
      });
    }

    // Update quantity
    item.kuantitas = newQuantity;

    // Hitung total baru
    const totalPrice = item.harga_per_item * newQuantity;

    res.json({
      success: true,
      message: "Jumlah berhasil diperbarui",
      newQuantity: newQuantity,
      totalPrice: totalPrice,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui jumlah",
    });
  }
};

// Export initCart juga untuk middleware
exports.initCart = initCart;
