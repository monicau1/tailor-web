// controllers/customer/profileController.js (ini di project folder pelanggan)
const { Pelanggan, AlamatPelanggan, AreaPengiriman } = require("../../models");
const bcrypt = require("bcrypt");

// const {
//   SHIPPING_AREAS,
//   STORE_LOCATION,
//   DELIVERY_METHODS,
//   RETURN_METHODS,
// } = require("../../shared/utils/shippingConfig");

exports.showProfile = async (req, res) => {
  try {
    const pelanggan = await Pelanggan.findByPk(req.session.userId);

    // Ambil hanya alamat yang belum di-soft-delete
    const daftarAlamat = await AlamatPelanggan.findAll({
      where: {
        id_pelanggan: req.session.userId,
        deleted_at: null, // Hanya ambil yang belum dihapus
      },
      order: [["id_alamat_pelanggan", "DESC"]],
    });

    res.render("customer/pages/profile/index", {
      title: "Profil Saya",
      pelanggan,
      daftarAlamat,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat profil");
    res.redirect("/");
  }
};

exports.showTambahAlamat = async (req, res) => {
  try {
    const areas = await AreaPengiriman.findAll({
      where: {
        status_pengiriman: true, // Hanya cek status_pengiriman
      },
      order: [["nama_area", "ASC"]],
    });

    res.render("customer/pages/profile/tambah-alamat", {
      title: "Tambah Alamat Baru",
      areas,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat halaman");
    res.redirect("/profile");
  }
};

exports.showEditAlamat = async (req, res) => {
  try {
    const { id } = req.params;

    const alamat = await AlamatPelanggan.findOne({
      where: {
        id_alamat_pelanggan: id,
        id_pelanggan: req.session.userId,
        deleted_at: null,
      },
    });

    if (!alamat) {
      req.flash("error", "Alamat tidak ditemukan");
      return res.redirect("/profile");
    }

    // Ambil daftar area yang aktif
    const areas = await AreaPengiriman.findAll({
      where: {
        status_pengiriman: true, // Hanya cek status_pengiriman
      },
      order: [["nama_area", "ASC"]],
    });

    res.render("customer/pages/profile/edit-alamat", {
      title: "Edit Alamat",
      alamat,
      areas,
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Terjadi kesalahan saat memuat halaman");
    res.redirect("/profile");
  }
};

exports.processTambahAlamat = async (req, res) => {
  try {
    const { area_code, alamat_jalan, kecamatan, provinsi, kode_pos } = req.body;

    // Validasi input
    if (!area_code || !alamat_jalan || !kecamatan || !provinsi || !kode_pos) {
      req.flash("error", "Semua field harus diisi");
      return res.redirect("/profile/alamat/tambah");
    }

    // Simpan alamat baru
    await AlamatPelanggan.create({
      id_pelanggan: req.session.userId,
      area_code,
      alamat_jalan,
      kecamatan,
      provinsi,
      kode_pos,
      negara: "Indonesia", // default value
    });

    req.flash("success", "Alamat berhasil ditambahkan");
    res.redirect("/profile");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menambahkan alamat");
    res.redirect("/profile/alamat/tambah");
  }
};

exports.hapusAlamat = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifikasi kepemilikan alamat
    const alamat = await AlamatPelanggan.findOne({
      where: {
        id_alamat_pelanggan: id,
        id_pelanggan: req.session.userId,
        deleted_at: null, // Hanya cari yang belum di-soft-delete
      },
    });

    if (!alamat) {
      req.flash("error", "Alamat tidak ditemukan");
      return res.redirect("/profile");
    }

    // Gunakan soft delete dengan mengupdate deleted_at
    await alamat.update({
      deleted_at: new Date(),
    });

    req.flash("success", "Alamat berhasil dihapus");
    res.redirect("/profile");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal menghapus alamat");
    res.redirect("/profile");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nama_pelanggan, email_pelanggan, nomor_telepon_pelanggan } =
      req.body;

    const pelanggan = await Pelanggan.findByPk(req.session.userId);

    if (!pelanggan) {
      req.flash("error", "Pelanggan tidak ditemukan");
      return res.redirect("/profile");
    }

    // Update data pelanggan
    await pelanggan.update({
      nama_pelanggan,
      email_pelanggan,
      nomor_telepon_pelanggan,
    });

    // Update session name jika berubah
    req.session.userName = nama_pelanggan;

    req.flash("success", "Profil berhasil diperbarui");
    res.redirect("/profile");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memperbarui profil");
    res.redirect("/profile");
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validasi field tidak boleh kosong
    if (!current_password || !new_password || !confirm_password) {
      req.flash("error", "Semua field harus diisi");
      return res.redirect("/profile");
    }

    // Validasi password baru
    if (new_password !== confirm_password) {
      req.flash("error", "Konfirmasi password baru tidak sesuai");
      return res.redirect("/profile");
    }

    const pelanggan = await Pelanggan.findByPk(req.session.userId);

    // Validasi password lama
    const validPassword = await bcrypt.compare(
      current_password,
      pelanggan.password_pelanggan
    );
    if (!validPassword) {
      req.flash("error", "Password saat ini tidak sesuai");
      return res.redirect("/profile");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pelanggan.update({
      password_pelanggan: hashedPassword,
    });

    req.flash("success", "Password berhasil diperbarui");
    res.redirect("/profile");
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "Gagal memperbarui password");
    res.redirect("/profile");
  }
};
