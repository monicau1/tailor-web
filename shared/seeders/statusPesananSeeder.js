// tailor-website/seeders/statusPesananSeeder.js
const { StatusPesanan } = require("../models");
const { STATUS_PESANAN } = require("../../shared/helpers/statusHelper");

async function seedStatusPesanan() {
  try {
    // Data status pesanan
    const statusList = [
      {
        nama_status: STATUS_PESANAN.MENUNGGU_PEMBAYARAN,
        deskripsi:
          "Pesanan telah dibuat dan menunggu pembayaran dari pelanggan",
        created_at: new Date(),
      },
      {
        nama_status: STATUS_PESANAN.MENUNGGU_KONFIRMASI,
        deskripsi: "Pembayaran telah diupload dan menunggu konfirmasi admin",
        created_at: new Date(),
      },
      {
        nama_status: STATUS_PESANAN.DIPROSES,
        deskripsi: "Pesanan sedang dikerjakan",
        created_at: new Date(),
      },
      {
        nama_status: STATUS_PESANAN.DIKIRIM,
        deskripsi: "Pesanan dalam proses pengiriman",
        created_at: new Date(),
      },
      {
        nama_status: STATUS_PESANAN.SELESAI,
        deskripsi: "Pesanan telah selesai",
        created_at: new Date(),
      },
      {
        nama_status: STATUS_PESANAN.DIBATALKAN,
        deskripsi: "Pesanan dibatalkan",
        created_at: new Date(),
      },
    ];

    // Insert data menggunakan bulkCreate
    await StatusPesanan.bulkCreate(statusList, {
      ignoreDuplicates: true,
    });

    console.log("Status pesanan berhasil ditambahkan!");
  } catch (error) {
    console.error("Error seeding status pesanan:", error);
    throw error;
  }
}

module.exports = seedStatusPesanan;
