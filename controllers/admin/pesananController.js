// controllers/admin/pesananController.js
const {
  Pesanan,
  Pegawai,
  Pelanggan,
  AlamatPelanggan,
  PesananPakaian,
  PesananPermak,
  ItemPesananPermak,
  JenisPermak,
  KategoriPermak,
  Pembayaran,
  Pengiriman,
  StatusPesanan,
  RiwayatStatusPesanan,
  InstruksiKhususPermak,
  VarianPakaian,
  Pakaian,
  GambarPakaian,
} = require("../../models");
const { Op } = require("sequelize");
const sequelize = require("../../utils/db.js");

const {
  getStatusColor,
  getStatusDisplay,
  STATUS_PESANAN,
} = require("../../shared/helpers/statusHelper");

const {
  formatNumber,
  formatDate,
  formatDateTime,
  formatDateValue,
  formatStatus,
  formatTime,
} = require("../../shared/helpers/formatHelper");

const {
  SHIPPING_AREAS,
  STORE_LOCATION,
} = require("../../shared/utils/shippingConfig");

// Get semua pesanan
exports.getAllPesanan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const jenisLayanan = req.query.jenis_layanan;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    // Build where clause
    let whereClause = {};

    // Filter pencarian
    if (search) {
      whereClause[Op.or] = [
        { "$PelangganPesanan.nama_pelanggan$": { [Op.like]: `%${search}%` } },
        {
          "$PelangganPesanan.nomor_telepon_pelanggan$": {
            [Op.like]: `%${search}%`,
          },
        },
        { id_pesanan: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter periode
    if (startDate && endDate) {
      // Konversi ke format tanggal yang benar
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date ke akhir hari
      end.setHours(23, 59, 59, 999);

      whereClause.tanggal_pesanan = {
        [Op.between]: [start, end],
      };
    }

    // Query database dengan include yang terpisah untuk pesanan pakaian dan permak
    const { count, rows: pesanan } = await Pesanan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: ["nama_pelanggan", "nomor_telepon_pelanggan"],
          required: true,
        },
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
            {
              model: ItemPesananPermak,
              as: "DetailPermak",
              include: [
                {
                  model: JenisPermak,
                  as: "JenisPermak",
                },
              ],
            },
          ],
        },
      ],
      order: [["tanggal_pesanan", "DESC"]],
      offset,
      limit,
      distinct: true,
    });

    // Filter jenis layanan jika diperlukan
    let filteredPesanan = pesanan;
    if (jenisLayanan) {
      filteredPesanan = pesanan.filter(
        (order) => order.jenis_layanan === jenisLayanan
      );
    }

    const totalPages = Math.ceil(count / limit);

    res.render("admin/pesanan/pesanan", {
      layout: "admin/partials/layout",
      title: "Daftar Pesanan",
      path: req.originalUrl,
      pesananList: filteredPesanan,
      totalPesanan: count,
      pagination: {
        totalPages,
        currentPage: page,
        totalItems: count,
      },
      query: {
        search,
        jenis_layanan: jenisLayanan,
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("admin/error", {
      layout: "admin/partials/layout",
      title: "Error",
      path: req.originalUrl,
      message: "Terjadi kesalahan saat memuat daftar pesanan",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Get detail pesanan
exports.getDetailPesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const pesanan = await Pesanan.findOne({
      where: { id_pesanan: id },
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: [
            "nama_pelanggan",
            "email_pelanggan",
            "nomor_telepon_pelanggan",
          ],
        },
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
          model: PesananPermak,
          as: "PesananPermak",
          required: false,
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
      return res.status(404).render("admin/error", {
        layout: "admin/partials/layout",
        title: "Pesanan Tidak Ditemukan",
        message: `Pesanan dengan ID ${id} tidak ditemukan`,
        path: req.originalUrl,
      });
    }

    // Tentukan template berdasarkan jenis layanan
    const viewTemplate =
      pesanan.jenis_layanan === "permak"
        ? "admin/pesanan/detail-permak"
        : "admin/pesanan/detail-pakaian";

    // Debug log untuk membantu troubleshooting
    if (process.env.NODE_ENV === "development") {
      if (pesanan.jenis_layanan === "pakaian") {
        console.log(
          "PesananPakaian:",
          JSON.stringify(pesanan.PesananPakaian, null, 2)
        );
      } else {
        console.log(
          "PesananPermak:",
          JSON.stringify(pesanan.PesananPermak, null, 2)
        );
      }
    }

    // Render view dengan data lengkap
    res.render(viewTemplate, {
      layout: "admin/partials/layout",
      title: `Detail Pesanan #${id}`,
      path: req.originalUrl,
      pesanan,
      // Format helpers
      formatNumber,
      formatDate,
      formatTime,
      formatDateTime,
      formatDateValue,
      formatStatus,
      // Status helpers
      getStatusColor,
      getStatusDisplay,
      STATUS_PESANAN,
      // Data tambahan jika diperlukan
      jenisLayanan: pesanan.jenis_layanan,
      statusPembayaran: pesanan.Pembayaran?.status_pembayaran || "pending",
      // Tambahan untuk debugging jika diperlukan
      debugMode: process.env.NODE_ENV === "development",
    });
  } catch (error) {
    console.error("Error pada getDetailPesanan:", error);

    let errorMessage = "Terjadi kesalahan saat memuat detail pesanan";
    if (process.env.NODE_ENV === "development") {
      errorMessage += `: ${error.message}`;
    }

    res.status(500).render("admin/error", {
      layout: "admin/partials/layout",
      title: "Error",
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error : {},
      path: req.originalUrl,
    });
  }
};

exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, estimasi_selesai, catatan, nama_penjahit } = req.body;

    // Cari pesanan dengan include yang diperlukan
    const pesanan = await Pesanan.findOne({
      where: { id_pesanan: id },
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
      transaction: t,
    });

    if (!pesanan) {
      throw new Error("Pesanan tidak ditemukan");
    }

    // Validasi alur status
    const statusFlow = {
      "menunggu pembayaran": ["dibatalkan"],
      "menunggu konfirmasi pembayaran": ["dibatalkan", "diproses"],
      diproses: ["dikirim", "selesai"],
      dikirim: ["selesai"],
      selesai: [],
      dibatalkan: [],
    };

    const currentStatus = pesanan.Status.nama_status;
    let allowedStatus = statusFlow[currentStatus] || [];

    // Tambahkan status diproses jika pembayaran sudah dikonfirmasi
    if (
      pesanan.Pembayaran?.status_pembayaran === "paid" &&
      !allowedStatus.includes("diproses")
    ) {
      allowedStatus.push("diproses");
    }

    // Validasi status baru
    if (!allowedStatus.includes(status)) {
      throw new Error("Status tidak valid dalam alur proses");
    }

    // Cari status master
    const statusMaster = await StatusPesanan.findOne({
      where: { nama_status: status },
      transaction: t,
    });

    if (!statusMaster) {
      throw new Error("Status tidak valid");
    }

    // Siapkan data update
    let updateData = {
      id_status: statusMaster.id_status_master,
    };

    // Tambahkan estimasi selesai jika ada
    if (estimasi_selesai) {
      updateData.estimasi_selesai = estimasi_selesai;
    }

    // Update nama penjahit hanya jika:
    // 1. Status baru adalah 'diproses'
    // 2. Ini adalah pesanan permak
    // 3. Ada nama penjahit yang dikirim
    if (
      status === "diproses" &&
      pesanan.jenis_layanan === "permak" &&
      nama_penjahit
    ) {
      updateData.nama_penjahit = nama_penjahit;
    }

    // Update pesanan
    await pesanan.update(updateData, { transaction: t });

    // Catat riwayat status
    await RiwayatStatusPesanan.create(
      {
        id_pesanan: id,
        id_status_master: statusMaster.id_status_master,
        keterangan: catatan || "Status pesanan diperbarui",
        tanggal_status: new Date(),
      },
      { transaction: t }
    );

    // Commit transaksi jika semua operasi berhasil
    await t.commit();

    // Kirim response sukses
    res.json({
      status: "success",
      message: "Status pesanan berhasil diperbarui",
      data: {
        new_status: status,
        estimasi_selesai: estimasi_selesai || null,
        nama_penjahit: updateData.nama_penjahit || null,
      },
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await t.rollback();

    console.error("Error pada updateStatus:", error);

    // Kirim response error
    res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengupdate status pesanan",
    });
  }
};

// Update pembayaran
exports.updatePayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status_pembayaran, catatan } = req.body;

    const pembayaran = await Pembayaran.findOne({
      where: { id_pesanan: id },
      transaction: t,
    });

    if (!pembayaran) {
      throw new Error("Data pembayaran tidak ditemukan");
    }

    await pembayaran.update(
      {
        status_pembayaran,
      },
      { transaction: t }
    );

    // Update status pesanan jika pembayaran berhasil
    if (status_pembayaran === "paid") {
      await Pesanan.update(
        {
          id_status: 2, // Status Diproses
        },
        {
          where: { id_pesanan: id },
          transaction: t,
        }
      );

      await RiwayatStatusPesanan.create(
        {
          id_pesanan: id,
          id_status_master: 2,
          keterangan: catatan || "Pembayaran telah dikonfirmasi",
          tanggal_status: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.json({
      status: "success",
      message: "Status pembayaran berhasil diperbarui",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengupdate pembayaran",
    });
  }
};
