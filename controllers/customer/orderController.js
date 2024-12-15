// controllers/customer/orderController.js (ini adalah controller pada website pelanggan bukan admin)
const {
  Pesanan,
  ItemPesananPermak,
  PesananPakaian,
  PesananPermak,
  RiwayatStatusPesanan,
  StatusPesanan,
  Pembayaran,
  JenisPermak,
  Pakaian,
  VarianPakaian,
  InstruksiKhususPermak,
  Pengiriman,
  AlamatPelanggan,
  GambarPakaian,
  Pelanggan,
  KategoriPermak,
} = require("../../models");

const {
  getStatusColor,
  getStatusDisplay,
  STATUS_PESANAN,
} = require("../../shared/helpers/statusHelper");

const { formatStatus } = require("../../shared/helpers/formatHelper");

exports.listOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Ambil langsung tanpa transform
    const { count, rows: pesanan } = await Pesanan.findAndCountAll({
      where: {
        id_pelanggan: req.session.userId,
      },
      include: [
        {
          model: StatusPesanan,
          as: "Status",
        },
        {
          model: PesananPakaian,
          as: "PesananPakaian",
          required: false,
          include: [
            {
              model: VarianPakaian,
              as: "VarianPakaian",
              include: [
                {
                  model: Pakaian,
                  as: "Pakaian",
                },
              ],
            },
          ],
        },
        {
          model: PesananPermak,
          as: "PesananPermak",
          required: false,
          include: [
            {
              model: KategoriPermak,
              as: "KategoriPermak",
            },
          ],
        },
      ],
      order: [["tanggal_pesanan", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    // Kirim langsung tanpa transform
    res.render("customer/pages/orders/index", {
      title: "Daftar Pesanan",
      pesanan: pesanan,
      currentPage: page,
      totalPages,
      query: req.query,
      getStatusColor,
      getStatusDisplay,
      STATUS_PESANAN,
      formatStatus: require("../../shared/helpers/formatHelper").formatStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat daftar pesanan");
    res.redirect("/");
  }
};

// Method untuk menentukan jenis pesanan dan redirect
exports.orderDetail = async (req, res) => {
  try {
    const { id, type } = req.params; // Ambil parameter type

    if (type === "pakaian") {
      return this.orderDetailJahit(req, res);
    } else if (type === "permak") {
      return this.orderDetailPermak(req, res);
    }

    // Jika tidak ada type, cek dari database
    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: id,
        id_pelanggan: req.session.userId,
      },
    });

    if (!pesanan) {
      req.flash("error", "Pesanan tidak ditemukan");
      return res.redirect("/orders");
    }

    // Redirect sesuai jenis layanan
    if (pesanan.jenis_layanan === "pakaian") {
      return this.orderDetailJahit(req, res);
    } else if (pesanan.jenis_layanan === "permak") {
      return this.orderDetailPermak(req, res);
    }

    req.flash("error", "Jenis pesanan tidak valid");
    return res.redirect("/orders");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat detail pesanan");
    res.redirect("/orders");
  }
};

exports.orderDetailPermak = async (req, res) => {
  try {
    const { id } = req.params;

    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: id,
        id_pelanggan: req.session.userId,
      },
      include: [
        {
          model: StatusPesanan,
          as: "Status",
        },
        {
          model: PesananPermak,
          as: "PesananPermak",
          separate: true,
          include: [
            {
              model: KategoriPermak,
              as: "KategoriPermak",
            },
            {
              model: ItemPesananPermak,
              as: "DetailPermak",
              include: [
                {
                  model: JenisPermak,
                  as: "JenisPermak",
                },
                {
                  model: InstruksiKhususPermak,
                  as: "InstruksiPermak",
                },
              ],
            },
          ],
        },
        {
          model: Pembayaran,
          as: "Pembayaran",
        },
        {
          model: Pengiriman,
          as: "Pengiriman",
          include: [
            {
              model: AlamatPelanggan,
              as: "AlamatPickup",
            },
            {
              model: AlamatPelanggan,
              as: "AlamatReturn",
            },
          ],
        },
        {
          model: RiwayatStatusPesanan,
          as: "RiwayatStatus",
          include: [
            {
              model: StatusPesanan,
              as: "StatusRiwayat",
            },
          ],
        },
      ],
    });

    if (!pesanan) {
      req.flash("error", "Pesanan tidak ditemukan");
      return res.redirect("/orders");
    }

    const orderDetails = {
      subtotal:
        pesanan.PesananPermak?.reduce((total, permak) => {
          return (
            total +
            (permak.DetailPermak?.reduce(
              (subTotal, item) =>
                subTotal + item.harga_per_item * item.kuantitas,
              0
            ) || 0)
          );
        }, 0) || 0,
      biaya_pengiriman: pesanan.Pengiriman?.biaya_pengiriman || 0,
      biaya_pengembalian: pesanan.Pengiriman?.biaya_pengembalian || 0,
    };

    orderDetails.total =
      orderDetails.subtotal +
      orderDetails.biaya_pengiriman +
      orderDetails.biaya_pengembalian;

    res.render("customer/pages/orders/detail-order-permak", {
      title: `Detail Pesanan Permak #${pesanan.id_pesanan}`,
      pesanan,
      orderDetails,
      getStatusColor,
      formatStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat detail pesanan");
    res.redirect("/orders");
  }
};

exports.orderDetailJahit = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching jahit order detail for ID:", id);

    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: id,
        id_pelanggan: req.session.userId,
        jenis_layanan: "pakaian",
      },
      include: [
        {
          model: StatusPesanan,
          as: "Status",
        },
        {
          model: PesananPakaian,
          as: "PesananPakaian",
          include: [
            {
              model: VarianPakaian,
              as: "VarianPakaian",
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
            },
          ],
        },
        {
          model: Pembayaran,
          as: "Pembayaran",
        },
        {
          model: RiwayatStatusPesanan,
          as: "RiwayatStatus",
          include: [
            {
              model: StatusPesanan,
              as: "StatusRiwayat",
            },
          ],
        },
        {
          model: Pengiriman,
          as: "Pengiriman",
          include: [
            {
              model: AlamatPelanggan,
              as: "Alamat",
            },
          ],
        },
      ],
    });

    const orderDetails = {
      subtotal:
        pesanan.PesananPakaian?.harga_per_item *
          pesanan.PesananPakaian?.kuantitas || 0,
      biaya_pengiriman: pesanan.Pengiriman?.biaya_pengiriman || 0,
    };
    console.log("Detail Pesanan:", {
      id: pesanan.id_pesanan,
      items: pesanan.PesananPermak?.DetailPermak?.map((item) => ({
        id: item.id_item_pesanan_permak,
        jenis: item.JenisPermak?.nama_permak,
        harga: item.harga_per_item,
        kuantitas: item.kuantitas,
      })),
    });

    res.render("customer/pages/orders/detail-order-jahit", {
      title: `Detail Pesanan Jahit #${pesanan.id_pesanan}`,
      pesanan,
      orderDetails,
      getStatusColor,
      formatStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat detail pesanan jahit pakaian");
    res.redirect("/orders");
  }
};

// Tampilkan halaman upload bukti pembayaran
exports.showUploadPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: id,
        id_pelanggan: req.session.userId,
      },
      include: [
        {
          model: StatusPesanan,
          as: "Status",
        },
        {
          model: Pembayaran,
          as: "Pembayaran",
        },
      ],
    });

    if (!pesanan) {
      req.flash("error", "Pesanan tidak ditemukan");
      return res.redirect("/orders");
    }

    // Cek batas waktu pembayaran
    if (pesanan.Pembayaran?.batas_waktu_pembayaran) {
      const now = new Date();
      const batasWaktu = new Date(pesanan.Pembayaran.batas_waktu_pembayaran);

      if (now > batasWaktu) {
        // 1. Update status pembayaran jadi expired
        await pesanan.Pembayaran.update({
          status_pembayaran: "expired",
        });

        // 2. Cari status "dibatalkan"
        const statusBatal = await StatusPesanan.findOne({
          where: { nama_status: "dibatalkan" },
        });

        if (statusBatal) {
          // 3. Update status pesanan jadi dibatalkan
          await pesanan.update({
            id_status: statusBatal.id_status_master,
          });

          // 4. Catat ke riwayat status
          await RiwayatStatusPesanan.create({
            id_pesanan: pesanan.id_pesanan,
            id_status_master: statusBatal.id_status_master,
            tanggal_status: new Date(),
            keterangan:
              "Pesanan dibatalkan karena melewati batas waktu pembayaran",
          });
        }

        req.flash(
          "error",
          "Batas waktu pembayaran telah berakhir. Pesanan dibatalkan."
        );
        return res.redirect(`/orders/${id}`);
      }
    }

    res.render("customer/pages/orders/upload-payment", {
      title: "Upload Bukti Pembayaran",
      pesanan,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memuat halaman upload pembayaran");
    res.redirect("/orders");
  }
};

exports.processUploadPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_asal, nama_rekening, nomor_rekening, catatan } = req.body;

    if (!req.file) {
      req.flash("error", "Bukti pembayaran wajib diupload");
      return res.redirect(`/orders/${id}/upload-payment`);
    }

    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: id,
        id_pelanggan: req.session.userId,
      },
      include: [
        {
          model: Pembayaran,
          as: "Pembayaran",
        },
      ],
    });

    if (!pesanan) {
      req.flash("error", "Pesanan tidak ditemukan");
      return res.redirect("/orders");
    }

    if (pesanan.Pembayaran) {
      // Cek jika pembayaran sudah diproses
      if (["paid", "failed"].includes(pesanan.Pembayaran.status_pembayaran)) {
        req.flash("error", "Pembayaran sudah diproses");
        return res.redirect(`/orders/${id}`);
      }

      // Cek batas waktu
      const now = new Date();
      const batasWaktu = new Date(pesanan.Pembayaran.batas_waktu_pembayaran);

      if (now > batasWaktu) {
        await pesanan.Pembayaran.update({ status_pembayaran: "expired" });
        req.flash("error", "Batas waktu pembayaran telah berakhir");
        return res.redirect(`/orders/${id}`);
      }

      // Update pembayaran
      await pesanan.Pembayaran.update({
        bank_asal,
        nama_rekening,
        nomor_rekening,
        bukti_pembayaran: req.file.filename,
        catatan_pembayaran: catatan,
      });

      // Update status pesanan
      const statusMenungguVerifikasi = await StatusPesanan.findOne({
        where: { nama_status: "menunggu verifikasi pembayaran" },
      });

      if (statusMenungguVerifikasi) {
        await pesanan.update({
          id_status: statusMenungguVerifikasi.id_status_master,
        });

        // Catat ke riwayat status
        await RiwayatStatusPesanan.create({
          id_pesanan: pesanan.id_pesanan,
          id_status_master: statusMenungguVerifikasi.id_status_master,
          tanggal_status: new Date(),
          keterangan: "Bukti pembayaran telah diupload",
        });
      }

      req.flash("success", "Bukti pembayaran berhasil diupload");
      return res.redirect(`/orders/${id}`);
    }

    req.flash("error", "Data pembayaran tidak ditemukan");
    return res.redirect(`/orders/${id}`);
  } catch (error) {
    console.error("Error in processUploadPayment:", error);
    req.flash("error", "Gagal mengupload bukti pembayaran");
    return res.redirect(`/orders/${id}/upload-payment`);
  }
};

// Di orderController.js
exports.previewLabel = async (req, res) => {
  try {
    const pesanan = await Pesanan.findOne({
      where: {
        id_pesanan: req.params.id,
        id_pelanggan: req.session.userId,
      },
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: ["nama_pelanggan", "nomor_telepon_pelanggan"],
        },
        {
          model: PesananPermak,
          as: "PesananPermak",
          include: [
            {
              model: KategoriPermak,
              as: "KategoriPermak",
            },
            {
              model: ItemPesananPermak,
              as: "DetailPermak",
              include: [
                {
                  model: JenisPermak,
                  as: "JenisPermak",
                },
                {
                  model: InstruksiKhususPermak,
                  as: "InstruksiPermak",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!pesanan) {
      return res.status(404).send("Pesanan tidak ditemukan");
    }

    // Informasi toko
    const store = {
      name: "Ahmad Tailor",
      address: "Jl. Pegadungan Raya No.2, Jakarta Barat",
      phone: "021-1234567",
    };

    res.render("customer/pages/orders/order-label", {
      layout: false,
      pesanan,
      store,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Gagal membuat label");
  }
};

exports.downloadLabel = async (req, res) => {
  try {
    // Import puppeteer secara dinamis hanya ketika dibutuhkan
    const puppeteer = require("puppeteer");

    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // Set viewport yang lebih kecil untuk ukuran A6
    await page.setViewport({
      width: 400, // Sesuaikan dengan ukuran A6
      height: 600,
    });

    // Gunakan URL lengkap
    const url = `http://localhost:${process.env.PORT || 5000}/orders/${
      req.params.id
    }/label/preview`;

    // Tambahkan logging
    console.log("Generating PDF for URL:", url);

    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Tunggu konten dimuat
    await page.waitForSelector(".label-content", { timeout: 5000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pdf = await page.pdf({
      format: "A6",
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    // Set header dan kirim PDF
    res.contentType("application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Label-Pesanan-${req.params.id}.pdf`
    );
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Gagal membuat PDF label");
  }
};

module.exports = exports;
