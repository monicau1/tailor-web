// controllers/admin/dashboardController.js
const {
  Pesanan,
  Pelanggan,
  Pembayaran,
  PesananPakaian,
  PesananPermak,
  JenisPermak,
  VarianPakaian,
  StatusPesanan,
  KategoriPermak,
  ItemPesananPermak,
} = require("../../models");
const { Op } = require("sequelize");
const sequelize = require("../../utils/db.js");

const getTotalPesanan = async () => {
  return await Pesanan.count({
    include: [
      {
        model: StatusPesanan,
        as: "Status",
        where: {
          nama_status: {
            [Op.ne]: "dibatalkan",
          },
        },
      },
    ],
  });
};

const getTotalPelanggan = async () => {
  return await Pelanggan.count();
};

const getTotalPendapatan = async () => {
  return (
    (await Pesanan.sum("jumlah_total", {
      include: [
        {
          model: StatusPesanan,
          as: "Status",
          where: {
            nama_status: "selesai",
          },
        },
      ],
    })) || 0
  );
};

const getPesananTerbaru = async () => {
  return await Pesanan.findAll({
    include: [
      {
        model: Pelanggan,
        as: "PelangganPesanan",
        attributes: ["nama_pelanggan"],
      },
      {
        model: PesananPakaian,
        as: "PesananPakaian",
        required: false,
      },
      {
        model: PesananPermak,
        as: "PesananPermak",
        required: false,
      },
      {
        model: StatusPesanan,
        as: "Status",
      },
    ],
    order: [["tanggal_pesanan", "DESC"]],
    limit: 5,
  });
};

exports.getDashboard = async (req, res) => {
  try {
    const [totalPesanan, totalPelanggan, totalPendapatan, pesananTerbaru] =
      await Promise.all([
        getTotalPesanan(),
        getTotalPelanggan(),
        getTotalPendapatan(),
        getPesananTerbaru(),
      ]);

    res.render("admin/dashboard", {
      layout: "admin/partials/layout",
      title: "Dashboard",
      path: req.originalUrl,
      totalPesanan,
      totalPelanggan,
      totalPendapatan,
      pesananTerbaru,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("admin/error", {
      message: "Terjadi kesalahan saat memuat dashboard",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

exports.getTrenPendapatan = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month === "all" ? "all" : parseInt(req.query.month);

    let whereCondition = {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("YEAR", sequelize.col("tanggal_pesanan")),
          year
        ),
        { "$Status.nama_status$": "selesai" },
      ],
    };

    if (month !== "all") {
      whereCondition[Op.and].push(
        sequelize.where(
          sequelize.fn("MONTH", sequelize.col("tanggal_pesanan")),
          month
        )
      );
    }

    const pesananSelesai = await Pesanan.findAll({
      attributes: [
        "id_pesanan",
        "tanggal_pesanan",
        "jenis_layanan",
        "jumlah_total",
      ],
      where: whereCondition,
      include: [
        {
          model: StatusPesanan,
          as: "Status",
          attributes: ["nama_status"],
          required: true,
        },
      ],
      order: [["tanggal_pesanan", "ASC"]],
    });

    const months =
      month === "all" ? Array.from({ length: 12 }, (_, i) => i + 1) : [month];

    const monthlyData = months.reduce((acc, month) => {
      const monthKey = new Date(year, month - 1).toLocaleDateString("id-ID", {
        month: "short",
      });
      acc[monthKey] = { jahit: 0, permak: 0 };
      return acc;
    }, {});

    pesananSelesai.forEach((pesanan) => {
      const pesananMonth = new Date(pesanan.tanggal_pesanan).toLocaleDateString(
        "id-ID",
        { month: "short" }
      );

      if (pesanan.jenis_layanan === "permak") {
        monthlyData[pesananMonth].permak += parseFloat(pesanan.jumlah_total);
      } else {
        monthlyData[pesananMonth].jahit += parseFloat(pesanan.jumlah_total);
      }
    });

    const formattedData = {
      labels: Object.keys(monthlyData),
      pendapatanPermak: Object.values(monthlyData).map((d) => d.permak),
      pendapatanJahit: Object.values(monthlyData).map((d) => d.jahit),
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Error in getTrenPendapatan:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memuat data tren pendapatan",
    });
  }
};

exports.getTotalPendapatanByPeriode = async (req, res) => {
  try {
    const { periode } = req.query;
    let whereCondition = {
      "$Status.nama_status$": "selesai",
    };

    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));

    switch (periode) {
      case "today":
        whereCondition.tanggal_pesanan = {
          [Op.gte]: startOfDay,
        };
        break;
      case "week":
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        whereCondition.tanggal_pesanan = {
          [Op.gte]: startOfWeek,
        };
        break;
      case "month":
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        whereCondition.tanggal_pesanan = {
          [Op.gte]: startOfMonth,
        };
        break;
      case "year":
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        whereCondition.tanggal_pesanan = {
          [Op.gte]: startOfYear,
        };
        break;
    }

    const total =
      (await Pesanan.sum("jumlah_total", {
        include: [
          {
            model: StatusPesanan,
            as: "Status",
            attributes: [],
          },
        ],
        where: whereCondition,
      })) || 0;

    res.json({
      success: true,
      total,
      periode,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  }
};
