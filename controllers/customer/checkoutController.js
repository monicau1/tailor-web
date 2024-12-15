// controllers/customer/checkoutController.js (ini adalah controller pada website pelanggan bukan admin)
const {
  InstruksiKhususPermak,
  Pesanan,
  AlamatPelanggan,
  StatusPesanan,
  VarianPakaian,
  Pakaian,
  Pengiriman,
  RiwayatStatusPesanan,
  ItemPesananPermak,
  PesananPakaian,
  PesananPermak,
  Pembayaran,
} = require("../../models");
const sequelize = require("../../utils/db.js");
const {
  SHIPPING_AREAS,
  STORE_LOCATION,
  DELIVERY_METHODS,
  RETURN_METHODS,
} = require("../../shared/utils/shippingConfig");

exports.showPermakCheckout = async (req, res) => {
  try {
    // Ambil dari session bukan database
    const cart = req.session.cart?.permak || [];

    if (cart.length === 0) {
      req.flash("error", "Keranjang permak kosong");
      return res.redirect("/cart");
    }

    // Ambil alamat pelanggan
    const alamatPelanggan = await AlamatPelanggan.findAll({
      where: {
        id_pelanggan: req.session.userId,
        deleted_at: null,
      },
    });

    res.render("customer/pages/checkout/permak", {
      title: "Checkout Permak",
      keranjang: {
        ItemKeranjang: cart, // Format untuk template yang sudah ada
      },
      alamatPelanggan,
      total: cart.reduce((sum, item) => {
        return (
          sum +
          item.DetailPermak.reduce((subSum, detail) => {
            return subSum + detail.harga_per_item * detail.kuantitas;
          }, 0)
        );
      }, 0),
      store: STORE_LOCATION,
      shippingAreas: SHIPPING_AREAS,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat halaman checkout");
    res.redirect("/cart");
  }
};

// Untuk Permak
exports.processPermakCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      id_alamat_pickup,
      id_alamat_return,
      delivery_method,
      return_method,
      metode_pembayaran,
    } = req.body;

    // Ambil data cart dari session
    const cart = req.session.cart?.permak || [];

    if (cart.length === 0) {
      req.flash("error", "Keranjang permak kosong");
      return res.redirect("/cart");
    }

    // Validasi input
    if (!delivery_method || !return_method || !metode_pembayaran) {
      req.flash("error", "Mohon lengkapi semua informasi");
      return res.redirect("/checkout/permak");
    }

    // Validasi alamat berdasarkan metode pengiriman
    if (delivery_method === "courier" && !id_alamat_pickup) {
      req.flash("error", "Mohon pilih alamat penjemputan");
      return res.redirect("/checkout/permak");
    }

    if (return_method === "courier" && !id_alamat_return) {
      req.flash("error", "Mohon pilih alamat pengantaran");
      return res.redirect("/checkout/permak");
    }

    // Hitung subtotal dari cart session
    let subtotal = cart.reduce((total, item) => {
      return (
        total +
        item.DetailPermak.reduce((subTotal, detail) => {
          return subTotal + detail.harga_per_item * detail.kuantitas;
        }, 0)
      );
    }, 0);

    // Hitung biaya pengiriman
    let biaya_pengiriman = 0;
    let biaya_pengembalian = 0;

    if (delivery_method === "courier") {
      const pickupAddress = await AlamatPelanggan.findByPk(id_alamat_pickup);
      if (pickupAddress?.area_code) {
        biaya_pengiriman = SHIPPING_AREAS[pickupAddress.area_code]?.cost || 0;
      }
    }

    if (return_method === "courier") {
      const returnAddress = await AlamatPelanggan.findByPk(id_alamat_return);
      if (returnAddress?.area_code) {
        biaya_pengembalian = SHIPPING_AREAS[returnAddress.area_code]?.cost || 0;
      }
    }

    const total = subtotal + biaya_pengiriman + biaya_pengembalian;

    // Buat pesanan baru
    let statusAwal = await StatusPesanan.findOne({
      where: { nama_status: "menunggu pembayaran" },
    });

    if (!statusAwal) {
      await t.rollback();
      console.error("Status 'menunggu pembayaran' tidak ditemukan di database");
      req.flash("error", "Terjadi kesalahan sistem. Silakan coba lagi.");
      return res.redirect("/checkout/permak"); // atau /checkout/jahit untuk processJahitCheckout
    }

    // 1. Buat pembayaran tanpa id_pesanan
    const pembayaran = await Pembayaran.create(
      {
        metode_pembayaran: metode_pembayaran,
        tanggal_pembayaran: new Date(),
        batas_waktu_pembayaran: new Date(Date.now() + 2 * 60 * 1000),
        status_pembayaran: "pending",
        jumlah_dibayar: total,
      },
      { transaction: t }
    );

    // 2. Buat pesanan dengan id_pembayaran
    const pesanan = await Pesanan.create(
      {
        id_pelanggan: req.session.userId,
        jenis_layanan: "permak",
        id_status: statusAwal.id_status_master,
        id_pembayaran: pembayaran.id_pembayaran,
        tanggal_pesanan: new Date(),
        jumlah_total: total,
      },
      { transaction: t }
    );

    // 3. Update id_pesanan di pembayaran
    await pembayaran.update(
      {
        id_pesanan: pesanan.id_pesanan,
      },
      { transaction: t }
    );

    // Buat record pengiriman
    const pengiriman = await Pengiriman.create(
      {
        id_pesanan: pesanan.id_pesanan,
        id_alamat_pickup:
          delivery_method === "courier" ? id_alamat_pickup : null,
        id_alamat_return: return_method === "courier" ? id_alamat_return : null,
        metode_pengiriman: delivery_method,
        metode_pengembalian: return_method,
        biaya_pengiriman,
        biaya_pengembalian,
        status_pengiriman: "pending",
      },
      { transaction: t }
    );

    // Update pesanan dengan id pengiriman
    await pesanan.update(
      {
        id_pengiriman: pengiriman.id_pengiriman,
      },
      { transaction: t }
    );

    // Simpan setiap item permak
    for (const item of cart) {
      // Buat PesananPermak
      console.log("Cart item:", item);
      console.log("Gambar dari cart:", item.gambar_permak);
      const pesananPermak = await PesananPermak.create(
        {
          id_pesanan: pesanan.id_pesanan,
          id_kategori_permak: item.id_kategori_permak,
          deskripsi_pakaian: item.deskripsi_pakaian,
          gambar_permak: item.gambar_permak,
        },
        { transaction: t }
      );

      // Tambahkan log ini
      console.log("Created PesananPermak:", pesananPermak.toJSON());

      // Simpan detail permak
      for (const detail of item.DetailPermak) {
        let instruksiKhususId = null;

        if (detail.InstruksiPermak) {
          const instruksiKhusus = await InstruksiKhususPermak.create(
            {
              id_jenis_permak: detail.id_jenis_permak,
              tipe_instruksi: detail.JenisPermak.tipe_permak,
              catatan_perubahan: detail.InstruksiPermak.catatan_perubahan,
              lokasi_perbaikan: detail.InstruksiPermak.lokasi_perbaikan,
              deskripsi_perbaikan: detail.InstruksiPermak.deskripsi_perbaikan,
              catatan_tambahan: detail.InstruksiPermak.catatan_tambahan,
            },
            { transaction: t }
          );
          instruksiKhususId = instruksiKhusus.id_instruksi_permak;
        }

        await ItemPesananPermak.create(
          {
            id_pesanan_permak: pesananPermak.id_pesanan_permak,
            id_jenis_permak: detail.id_jenis_permak,
            id_instruksi_permak: instruksiKhususId,
            kuantitas: detail.kuantitas,
            harga_per_item: detail.harga_per_item,
          },
          { transaction: t }
        );
      }
    }

    // Catat riwayat status
    await RiwayatStatusPesanan.create(
      {
        id_pesanan: pesanan.id_pesanan,
        id_status_master: statusAwal.id_status_master,
        tanggal_status: new Date(),
        keterangan: "Pesanan dibuat",
      },
      { transaction: t }
    );

    // Kosongkan keranjang di session
    req.session.cart.permak = [];
    await req.session.save();

    await t.commit();

    req.flash("success", "Pesanan berhasil dibuat");
    res.redirect(`/checkout/success/${pesanan.id_pesanan}`);
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    req.flash("error", "Gagal memproses pesanan");
    res.redirect("/checkout/permak");
  }
};

exports.showJahitCheckout = async (req, res) => {
  try {
    // Ambil dari session cart dan format sesuai yang dibutuhkan template
    const cart = req.session.cart?.pakaian || [];

    if (cart.length === 0) {
      req.flash("error", "Keranjang jahit kosong");
      return res.redirect("/cart");
    }

    // Ambil alamat pelanggan
    const alamatPelanggan = await AlamatPelanggan.findAll({
      where: {
        id_pelanggan: req.session.userId,
        deleted_at: null,
      },
    });

    // Format data dengan property yang sesuai template
    const formattedItems = cart.map((item) => ({
      ...item,
      harga_per_item_pakaian: item.harga_per_item, // Tambah property ini
      kuantitas_pakaian: item.kuantitas, // Dan ini
      VarianPakaian: {
        id_varian_pakaian: item.id_varian_pakaian,
        ukuran: item.ukuran,
        warna: item.warna,
        Pakaian: {
          nama_pakaian: item.nama_pakaian,
          GambarPakaian: item.gambar ? [{ nama_file: item.gambar }] : [],
        },
      },
    }));

    // Hitung total
    const total = cart.reduce((sum, item) => {
      return sum + item.harga_per_item * item.kuantitas;
    }, 0);

    res.render("customer/pages/checkout/jahit", {
      title: "Checkout Jahit",
      keranjang: {
        ItemKeranjang: formattedItems,
      },
      alamatPelanggan,
      total,
      shippingAreas: SHIPPING_AREAS,
      store: STORE_LOCATION,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat halaman checkout");
    res.redirect("/cart");
  }
};

exports.processJahitCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Ambil data dari form
    const {
      id_alamat_pelanggan,
      delivery_method,
      metode_pembayaran,
      catatan_pesanan,
    } = req.body;

    // Ambil cart dari session
    const cart = req.session.cart?.pakaian || [];

    // Validasi dasar
    if (cart.length === 0) {
      req.flash("error", "Keranjang jahit kosong");
      return res.redirect("/cart");
    }

    if (!id_alamat_pelanggan || !delivery_method || !metode_pembayaran) {
      req.flash("error", "Mohon lengkapi semua informasi");
      return res.redirect("/checkout/jahit");
    }

    // Ambil alamat pengiriman
    const alamatPengiriman = await AlamatPelanggan.findOne({
      where: {
        id_alamat_pelanggan: id_alamat_pelanggan,
        id_pelanggan: req.session.userId,
      },
      transaction: t,
    });

    if (!alamatPengiriman) {
      req.flash("error", "Alamat pengiriman tidak ditemukan");
      return res.redirect("/checkout/jahit");
    }

    // Validasi stok
    for (const item of cart) {
      if (item.id_varian_pakaian) {
        const varian = await VarianPakaian.findByPk(item.id_varian_pakaian, {
          transaction: t,
          include: [{ model: Pakaian, as: "Pakaian" }],
        });

        if (!varian) {
          await t.rollback();
          req.flash("error", "Beberapa pakaian tidak tersedia");
          return res.redirect("/cart");
        }

        if (varian.stok < item.kuantitas) {
          await t.rollback();
          req.flash(
            "error",
            `Stok ${varian.Pakaian.nama_pakaian} tidak mencukupi`
          );
          return res.redirect("/cart");
        }

        // Kurangi stok
        await varian.update(
          {
            stok: varian.stok - item.kuantitas,
          },
          { transaction: t }
        );
      }
    }

    // Hitung total biaya
    const subtotal = cart.reduce((total, item) => {
      return total + item.harga_per_item * item.kuantitas;
    }, 0);

    // Hitung biaya pengiriman
    let biaya_pengiriman = 0;
    if (delivery_method === "courier") {
      biaya_pengiriman = SHIPPING_AREAS[alamatPengiriman.area_code]?.cost || 0;
    }

    const total = subtotal + biaya_pengiriman;

    // Buat pesanan baru
    let statusAwal = await StatusPesanan.findOne({
      where: { nama_status: "menunggu pembayaran" },
    });

    if (!statusAwal) {
      await t.rollback();
      console.error("Status 'menunggu pembayaran' tidak ditemukan di database");
      req.flash("error", "Terjadi kesalahan sistem. Silakan coba lagi.");
      return res.redirect("/checkout/permak");
    }

    // 1. Buat pembayaran tanpa id_pesanan
    const pembayaran = await Pembayaran.create(
      {
        metode_pembayaran: metode_pembayaran,
        tanggal_pembayaran: new Date(),
        batas_waktu_pembayaran: new Date(Date.now() + 2 * 60 * 1000),
        status_pembayaran: "pending",
        jumlah_dibayar: total,
      },
      { transaction: t }
    );

    // 2. Buat pesanan dengan id_pembayaran
    const pesanan = await Pesanan.create(
      {
        id_pelanggan: req.session.userId,
        jenis_layanan: "pakaian",
        id_status: statusAwal.id_status_master,
        id_pembayaran: pembayaran.id_pembayaran,
        tanggal_pesanan: new Date(),
        jumlah_total: total,
      },
      { transaction: t }
    );

    // 3. Update id_pesanan di pembayaran
    await pembayaran.update(
      {
        id_pesanan: pesanan.id_pesanan,
      },
      { transaction: t }
    );

    // Buat record pengiriman
    const pengiriman = await Pengiriman.create(
      {
        id_pesanan: pesanan.id_pesanan,
        id_alamat_pelanggan: alamatPengiriman.id_alamat_pelanggan,
        metode_pengiriman: delivery_method,
        metode_pengembalian: "courier", // Untuk jahit selalu pakai kurir
        perkiraan_tanggal_pengiriman: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ),
        status_pengiriman: "pending",
        biaya_pengiriman,
        biaya_pengembalian: 0,
      },
      { transaction: t }
    );

    // Update id_pengiriman di pesanan
    await pesanan.update(
      {
        id_pengiriman: pengiriman.id_pengiriman,
      },
      { transaction: t }
    );

    // Simpan item pesanan jahit
    for (const item of cart) {
      await PesananPakaian.create(
        {
          id_pesanan: pesanan.id_pesanan,
          id_varian_pakaian: item.id_varian_pakaian,
          kuantitas: item.kuantitas,
          harga_per_item: item.harga_per_item,
          catatan: item.catatan,
        },
        { transaction: t }
      );
    }

    // Catat riwayat status
    await RiwayatStatusPesanan.create(
      {
        id_pesanan: pesanan.id_pesanan,
        id_status_master: statusAwal.id_status_master,
        tanggal_status: new Date(),
        keterangan: "Pesanan dibuat",
      },
      { transaction: t }
    );

    // Kosongkan keranjang jahit di session
    req.session.cart.pakaian = [];
    await req.session.save();

    await t.commit();

    req.flash("success", "Pesanan berhasil dibuat");
    res.redirect(`/checkout/success/${pesanan.id_pesanan}`);
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    req.flash("error", "Gagal memproses pesanan");
    res.redirect("/checkout/jahit");
  }
};

exports.showSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;

    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: orderId,
        id_pelanggan: req.session.userId,
      },
      include: [{ model: StatusPesanan, as: "Status" }],
    });

    if (!pesanan) {
      req.flash("error", "Pesanan tidak ditemukan");
      return res.redirect("/");
    }

    res.render("customer/pages/checkout/success", {
      title: "Checkout Berhasil",
      pesanan,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat halaman");
    res.redirect("/");
  }
};
