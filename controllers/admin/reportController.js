// controllers/admin/reportController.js
const { Pembayaran, Pesanan, Pelanggan } = require("../../models");
const sequelize = require("../../utils/db.js");
const { Op } = require("sequelize");
const excel = require("exceljs");

const {
  formatNumber,
  formatDate,
  formatDateTime,
  formatTime,
  formatStatus,
} = require("../../shared/helpers/formatHelper");

// Get laporan pembayaran
exports.getPaymentReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    const where = {};
    if (req.query.status) {
      where.status_pembayaran = req.query.status;
    }
    if (req.query.start_date && req.query.end_date) {
      where.tanggal_pembayaran = {
        [Op.between]: [
          `${req.query.start_date} 00:00:00`,
          `${req.query.end_date} 23:59:59`,
        ],
      };
    }

    // Get payments with pagination
    const { count, rows: payments } = await Pembayaran.findAndCountAll({
      where,
      include: [
        {
          model: Pesanan,
          as: "Pesanan",
          include: [
            {
              model: Pelanggan,
              as: "PelangganPesanan",
            },
          ],
        },
      ],
      order: [["tanggal_pembayaran", "DESC"]],
      offset,
      limit,
      distinct: true,
    });

    // Get summary
    const summary = await Pembayaran.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("jumlah_dibayar")), "total_income"],
        [sequelize.fn("COUNT", sequelize.col("id_pembayaran")), "total_count"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN status_pembayaran = 'pending' THEN jumlah_dibayar ELSE 0 END"
            )
          ),
          "pending_amount",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN status_pembayaran = 'pending' THEN 1 END"
            )
          ),
          "pending_count",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN status_pembayaran = 'paid' THEN jumlah_dibayar ELSE 0 END"
            )
          ),
          "success_amount",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status_pembayaran = 'paid' THEN 1 END")
          ),
          "success_count",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              "CASE WHEN status_pembayaran = 'failed' THEN jumlah_dibayar ELSE 0 END"
            )
          ),
          "failed_amount",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN status_pembayaran = 'failed' THEN 1 END"
            )
          ),
          "failed_count",
        ],
      ],
      where,
    });

    res.render("admin/laporan/pembayaran", {
      layout: "admin/partials/layout",
      title: "Laporan Pembayaran",
      payments,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count,
      },
      query: req.query || {},
      summary: summary[0] || {
        total_income: 0,
        total_count: 0,
        pending_amount: 0,
        pending_count: 0,
        success_amount: 0,
        success_count: 0,
        failed_amount: 0,
        failed_count: 0,
      },
      formatNumber,
      formatDate,
      formatDateTime,
      formatTime,
      formatStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("admin/error", {
      layout: "admin/partials/layout",
      title: "Error",
      message: "Terjadi kesalahan saat memuat laporan pembayaran",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

// Export ke Excel
exports.exportPaymentReport = async (req, res) => {
  try {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Pembayaran");

    // Set kolom
    worksheet.columns = [
      { header: "No. Pesanan", key: "id_pesanan", width: 15 },
      { header: "Tanggal", key: "tanggal", width: 20 },
      { header: "Pelanggan", key: "pelanggan", width: 25 },
      { header: "Metode", key: "metode", width: 15 },
      { header: "Bank", key: "bank", width: 15 },
      { header: "Nama Rekening", key: "rekening", width: 25 },
      { header: "Jumlah", key: "jumlah", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    // Build filter conditions for export
    const where = {};
    if (req.query.status) {
      where.status_pembayaran = req.query.status;
    }
    if (req.query.start_date && req.query.end_date) {
      where.tanggal_pembayaran = {
        [Op.between]: [
          `${req.query.start_date} 00:00:00`,
          `${req.query.end_date} 23:59:59`,
        ],
      };
    }

    // Ambil data
    const payments = await Pembayaran.findAll({
      where,
      include: [
        {
          model: Pesanan,
          as: "Pesanan",
          include: [
            {
              model: Pelanggan,
              as: "PelangganPesanan",
            },
          ],
        },
      ],
      order: [["tanggal_pembayaran", "DESC"]],
    });

    // Masukkan data
    payments.forEach((payment) => {
      worksheet.addRow({
        id_pesanan: payment.Pesanan.id_pesanan,
        tanggal: formatDateTime(payment.tanggal_pembayaran),
        pelanggan: payment.Pesanan.PelangganPesanan.nama_pelanggan,
        metode: payment.metode_pembayaran,
        bank: payment.bank_asal || "-",
        rekening: payment.nama_rekening || "-",
        jumlah: formatNumber(payment.jumlah_dibayar),
        status: formatStatus(payment.status_pembayaran),
      });
    });

    // Set response headers untuk download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan-Pembayaran-${formatDate(new Date())}.xlsx`
    );

    // Kirim workbook langsung ke response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengexport laporan",
    });
  }
};
