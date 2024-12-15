// tailor-website/seeders/runSeeders.js
const seedStatusPesanan = require("./statusPesananSeeder");

async function runSeeders() {
  try {
    // Jalankan seeder status pesanan
    await seedStatusPesanan();

    console.log("Semua seeder berhasil dijalankan!");
    process.exit();
  } catch (error) {
    console.error("Error menjalankan seeder:", error);
    process.exit(1);
  }
}

runSeeders();
