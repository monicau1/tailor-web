// seeders/statusPesananSeeder.js (ini di pengguna)
const { StatusPesanan } = require("../../admin-tailor-website-main/models");

async function seedStatusPesanan() {
  try {
    // Data status pesanan
    const statusList = [
      {
        nama_status: "menunggu pembayaran",
        deskripsi:
          "Pesanan telah dibuat dan menunggu pembayaran dari pelanggan",
        created_at: new Date(),
      },
      {
        nama_status: "menunggu konfirmasi pembayaran",
        deskripsi: "Pembayaran telah diupload dan menunggu konfirmasi admin",
        created_at: new Date(),
      },
      {
        nama_status: "diproses",
        deskripsi: "Pesanan sedang dikerjakan",
        created_at: new Date(),
      },
      {
        nama_status: "dikirim",
        deskripsi: "Pesanan dalam proses pengiriman",
        created_at: new Date(),
      },
      {
        nama_status: "selesai",
        deskripsi: "Pesanan telah selesai",
        created_at: new Date(),
      },
      {
        nama_status: "dibatalkan",
        deskripsi: "Pesanan dibatalkan",
        created_at: new Date(),
      },
    ];

    // Insert data
    for (const status of statusList) {
      await StatusPesanan.findOrCreate({
        where: { nama_status: status.nama_status },
        defaults: status,
      });
    }

    console.log("Status pesanan berhasil ditambahkan!");
  } catch (error) {
    console.error("Error seeding status pesanan:", error);
  }
}

// Export seeder function
module.exports = seedStatusPesanan;
