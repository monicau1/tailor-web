// controllers/pesananPermakController.js
const {
  Pesanan,
  Pelanggan,
  AlamatPelanggan,
  ItemPesanan,
  JenisPermak,
  KategoriPermak,
  Pembayaran,
  Pengiriman,
  StatusPesanan,
  InstruksiKhusus,
} = require("../../models");
const sequelize = require("../../utils/db.js");
const { Op } = require("sequelize");
const fs = require("fs").promises;
const path = require("path");

// Show create form
exports.showCreateForm = async (req, res) => {
  try {
    // Get data untuk dropdowns
    const [pelangganList, kategoriList] = await Promise.all([
      Pelanggan.findAll({
        order: [["nama_pelanggan", "ASC"]],
      }),
      KategoriPermak.findAll({
        order: [["nama_kategori_permak", "ASC"]],
        include: [
          {
            model: JenisPermak,
            as: "JenisPermak",
            attributes: ["id_jenis_permak", "nama_permak", "harga"],
          },
        ],
      }),
    ]);

    res.render("admin/pesanan/permak-form", {
      layout: "partials/layout",
      title: "Tambah Pesanan Permak",
      path: req.originalUrl,
      pelangganList,
      kategoriList,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/pesanan?error=" +
        encodeURIComponent("Gagal memuat form tambah pesanan")
    );
  }
};

// Get jenis permak by kategori
exports.getJenisPermakByKategori = async (req, res) => {
  try {
    const { kategoriId } = req.params;

    if (!kategoriId || isNaN(kategoriId)) {
      return res.status(400).json({
        status: "error",
        message: "ID Kategori tidak valid",
      });
    }

    const jenisList = await JenisPermak.findAll({
      where: {
        id_kategori_permak: kategoriId,
      },
      attributes: ["id_jenis_permak", "nama_permak", "harga"],
      order: [["nama_permak", "ASC"]],
    });

    return res.json({
      status: "success",
      data: jenisList,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data jenis permak",
    });
  }
};

// Handle file upload
async function handleFileUpload(file, type) {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Format file tidak didukung");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file terlalu besar (max 5MB)");
  }

  const uploadDir = path.join(
    __dirname,
    `../../shared/uploads/pelanggan/${type}`
  );
  const filename = `${type}-${Date.now()}${path.extname(file.originalname)}`;
  const filepath = path.join(uploadDir, filename);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.rename(file.path, filepath);

  return filename;
}

// controllers/pesananPermakController.js

async function handlePakaianAndPermak(pakaian, pesananId, transaction) {
  try {
    let totalBiaya = 0;

    // Handle foto pakaian
    const fotoFilename = pakaian.foto
      ? await handleFileUpload(pakaian.foto, "permak")
      : null;

    // Process setiap permak item
    for (const permak of pakaian.permakItems) {
      // Validasi jenis permak
      const jenisPermak = await JenisPermak.findByPk(permak.jenis_permak, {
        transaction,
      });
      if (!jenisPermak) {
        throw new Error(`Jenis permak tidak ditemukan`);
      }

      // 1. Buat ItemPesanan dulu
      const itemPesanan = await ItemPesanan.create(
        {
          id_pesanan: pesananId,
          id_jenis_permak: permak.jenis_permak,
          id_status_master: 1,
          kuantitas: 1,
          harga_per_item: jenisPermak.harga,
          gambar_permak: fotoFilename,
        },
        { transaction }
      );

      // 2. Setelah ItemPesanan dibuat, baru buat InstruksiKhusus
      await InstruksiKhusus.create(
        {
          id_item_pesanan: itemPesanan.id_item_pesanan, // Gunakan ID dari ItemPesanan yang baru dibuat
          jenis_instruksi: "permak",
          lokasi_perbaikan: permak.lokasi_perbaikan,
          deskripsi_perbaikan: permak.deskripsi_perbaikan,
          catatan: permak.catatan || null,
          deskripsi_item: pakaian.deskripsi_pakaian,
        },
        { transaction }
      );

      totalBiaya += jenisPermak.harga;
    }

    return totalBiaya;
  } catch (error) {
    throw error;
  }
}

exports.createPermak = async (req, res) => {
  const t = await sequelize.transaction();
  const uploadedFiles = [];

  try {
    // 1. Handle customer data
    const pelanggan = await handleCustomerData(req.body, t);

    // 2. Create alamat
    const alamat = await handleAddressData(req.body, pelanggan.id_pelanggan, t);

    // 3. Create pesanan
    const pesanan = await Pesanan.create(
      {
        id_pelanggan: pelanggan.id_pelanggan,
        id_status: 1,
        tanggal_pesanan: new Date(),
      },
      { transaction: t }
    );

    // 4. Handle payment and shipping
    const [pembayaran, pengiriman] = await Promise.all([
      handlePaymentData(req.body, req.files, pesanan.id_pesanan, t),
      handleShippingData(
        req.body,
        alamat.id_alamat_pelanggan,
        pesanan.id_pesanan,
        t
      ),
    ]);

    // Track uploaded files
    if (req.files?.bukti_pembayaran?.[0]) {
      uploadedFiles.push(req.files.bukti_pembayaran[0].path);
    }

    // 5. Update pesanan with references
    await pesanan.update(
      {
        id_pengiriman: pengiriman.id_pengiriman,
        id_pembayaran: pembayaran.id_pembayaran,
      },
      { transaction: t }
    );

    // 6. Process pakaian items
    let totalBiaya = 0;
    const pakaianData = getPakaianArrayFromBody(req.body);

    for (let i = 0; i < pakaianData.length; i++) {
      const pakaian = pakaianData[i];

      // Assign foto if exists
      if (req.files?.["foto_pakaian"]?.[i]) {
        const fotoFile = req.files["foto_pakaian"][i];
        uploadedFiles.push(fotoFile.path);
        pakaian.foto = fotoFile;
      }

      const pakaianBiaya = await handlePakaianAndPermak(
        pakaian,
        pesanan.id_pesanan,
        t
      );
      totalBiaya += pakaianBiaya;
    }

    // 7. Update total payments
    const biayaPengiriman = parseInt(req.body.biaya_pengiriman) || 0;
    const totalPesanan = totalBiaya + biayaPengiriman;

    await Promise.all([
      pembayaran.update({ jumlah_dibayar: totalPesanan }, { transaction: t }),
      pesanan.update({ jumlah_total: totalPesanan }, { transaction: t }),
    ]);

    await t.commit();

    res.status(201).json({
      status: "success",
      message: "Pesanan permak berhasil dibuat",
      data: {
        id_pesanan: pesanan.id_pesanan,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);

    // Cleanup uploaded files on error
    for (const filePath of uploadedFiles) {
      try {
        if (filePath && fs.existsSync(filePath)) {
          await fs.unlink(filePath);
        }
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat membuat pesanan",
    });
  }
};

// Helper function untuk mendapatkan data pakaian dari body
function getPakaianArrayFromBody(body) {
  const result = [];
  const deskripsiPakaian = Array.isArray(body.deskripsi_pakaian)
    ? body.deskripsi_pakaian
    : [body.deskripsi_pakaian];

  for (let i = 0; i < deskripsiPakaian.length; i++) {
    const permakItems = getPermakItemsForPakaian(body, i);

    if (permakItems.length > 0) {
      result.push({
        deskripsi_pakaian: deskripsiPakaian[i],
        permakItems: permakItems,
      });
    }
  }

  return result;
}

// Helper function untuk mendapatkan permak items untuk satu pakaian
function getPermakItemsForPakaian(body, pakaianIndex) {
  const permakItems = [];
  const prefix = Array.isArray(body.deskripsi_pakaian)
    ? `[${pakaianIndex}]`
    : "";

  const jenisPermak = body[`jenis_permak${prefix}`];
  const lokasiPerbaikan = body[`lokasi_perbaikan${prefix}`];
  const deskripsiPerbaikan = body[`deskripsi_perbaikan${prefix}`];
  const catatanPermak = body[`catatan_permak${prefix}`];

  // Handle baik array maupun single value
  const itemCount = Array.isArray(jenisPermak) ? jenisPermak.length : 1;

  for (let i = 0; i < itemCount; i++) {
    permakItems.push({
      jenis_permak: Array.isArray(jenisPermak) ? jenisPermak[i] : jenisPermak,
      lokasi_perbaikan: Array.isArray(lokasiPerbaikan)
        ? lokasiPerbaikan[i]
        : lokasiPerbaikan,
      deskripsi_perbaikan: Array.isArray(deskripsiPerbaikan)
        ? deskripsiPerbaikan[i]
        : deskripsiPerbaikan,
      catatan: Array.isArray(catatanPermak) ? catatanPermak[i] : catatanPermak,
    });
  }

  return permakItems;
}

// Helper functions

async function handleCustomerData(body, transaction) {
  if (body.id_pelanggan) {
    const pelanggan = await Pelanggan.findByPk(body.id_pelanggan);
    if (!pelanggan) throw new Error("Pelanggan tidak ditemukan");
    return pelanggan;
  }

  return await Pelanggan.create(
    {
      nama_pelanggan: body.nama_pelanggan,
      email_pelanggan: body.email_pelanggan || null,
      nomor_telepon_pelanggan: body.nomor_telepon_pelanggan || null,
      tanggal_registrasi_pelanggan: new Date(),
    },
    { transaction }
  );
}

async function handleAddressData(body, idPelanggan, transaction) {
  const isPickup = body.pickupMethod === "pickup";

  return await AlamatPelanggan.create(
    {
      id_pelanggan: idPelanggan,
      alamat_jalan: isPickup ? "Ambil di Toko" : body.alamat_jalan,
      kecamatan: isPickup ? "-" : body.kecamatan,
      provinsi: isPickup ? "-" : body.provinsi,
      kode_pos: isPickup ? "00000" : body.kode_pos,
      negara: "Indonesia",
    },
    { transaction }
  );
}

async function handlePaymentData(body, files, idPesanan, transaction) {
  let buktiPembayaranFilename = null;
  if (files?.bukti_pembayaran?.[0]) {
    buktiPembayaranFilename = await handleFileUpload(
      files.bukti_pembayaran[0],
      "pembayaran"
    );
  }

  return await Pembayaran.create(
    {
      id_pesanan: idPesanan,
      metode_pembayaran: body.metode_pembayaran,
      status_pembayaran: body.status_pembayaran || "pending",
      tanggal_pembayaran: new Date(),
      jumlah_dibayar: 0,
      bukti_pembayaran: buktiPembayaranFilename,
    },
    { transaction }
  );
}

async function handleShippingData(body, idAlamat, idPesanan, transaction) {
  const isPickup = body.pickupMethod === "pickup";

  return await Pengiriman.create(
    {
      id_alamat_pelanggan: idAlamat,
      id_pesanan: idPesanan,
      jasa_pengiriman: isPickup ? "pickup" : body.jasa_pengiriman,
      biaya_pengiriman: isPickup ? 0 : parseInt(body.biaya_pengiriman) || 0,
      status_pengiriman: isPickup ? "pickup" : "pending",
    },
    { transaction }
  );
}

function getPakaianArrayFromBody(body) {
  const result = [];

  // Get all unique indices from the form data
  const deskripsiPakaian = body.deskripsi_pakaian || [];

  for (let i = 0; i < deskripsiPakaian.length; i++) {
    // Get all permak items for this pakaian
    const permakItems = getPermakItemsForPakaian(body, i);

    result.push({
      index: i,
      deskripsi_pakaian: deskripsiPakaian[i],
      permakItems,
    });
  }

  return result;
}

function getPermakItemsForPakaian(body, pakaianIndex) {
  const permakItems = [];
  const jenisPermak = body.jenis_permak || [];
  const lokasiPerbaikan = body.lokasi_perbaikan || [];
  const deskripsiPerbaikan = body.deskripsi_perbaikan || [];
  const catatanPermak = body.catatan_permak || [];

  // Find all permak items that belong to this pakaian
  // This depends on how your form submits the data
  // You might need to adjust this logic based on your form structure
  jenisPermak.forEach((jenis, index) => {
    permakItems.push({
      jenis_permak: jenis,
      lokasi_perbaikan: lokasiPerbaikan[index],
      deskripsi_perbaikan: deskripsiPerbaikan[index],
      catatan: catatanPermak[index],
    });
  });

  return permakItems;
}
