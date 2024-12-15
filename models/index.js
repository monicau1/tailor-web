// models/index.js
const KategoriPakaian = require("./KategoriPakaian");
const Pakaian = require("./Pakaian");
const GambarPakaian = require("./GambarPakaian");
const VarianPakaian = require("./VarianPakaian");
const KategoriPermak = require("./KategoriPermak");
const JenisPermak = require("./JenisPermak");
const Pegawai = require("./Pegawai");
const Pelanggan = require("./Pelanggan");
const AlamatPelanggan = require("./AlamatPelanggan");
const StatusPesanan = require("./StatusPesanan");
const Pesanan = require("./Pesanan");
const PesananPermak = require("./PesananPermak");
const PesananPakaian = require("./PesananPakaian");
const ItemPesananPermak = require("./ItemPesananPermak");
const RiwayatStatusPesanan = require("./RiwayatStatusPesanan");
const Pengiriman = require("./Pengiriman");
const Pembayaran = require("./Pembayaran");
const AreaPengiriman = require("./AreaPengiriman");
const Keranjang = require("./Keranjang");
const KeranjangPakaian = require("./KeranjangPakaian");
const KeranjangPermak = require("./KeranjangPermak");
const ItemKeranjangPermak = require("./ItemKeranjangPermak");
const InstruksiKhususPermak = require("./InstruksiKhususPermak");

// Relasi Produk Pakaian
KategoriPakaian.hasMany(Pakaian, {
  foreignKey: "id_kategori_pakaian",
  as: "Pakaian",
});

Pakaian.belongsTo(KategoriPakaian, {
  foreignKey: "id_kategori_pakaian",
  as: "KategoriPakaian",
});

Pakaian.hasMany(GambarPakaian, {
  foreignKey: "id_pakaian",
  as: "GambarPakaian",
});

GambarPakaian.belongsTo(Pakaian, {
  foreignKey: "id_pakaian",
  as: "Pakaian",
});

Pakaian.hasMany(VarianPakaian, {
  foreignKey: "id_pakaian",
  as: "VarianPakaian",
});

VarianPakaian.belongsTo(Pakaian, {
  foreignKey: "id_pakaian",
  as: "Pakaian",
});

// Relasi Layanan Permak
KategoriPermak.hasMany(JenisPermak, {
  foreignKey: "id_kategori_permak",
  as: "JenisPermak",
});

JenisPermak.belongsTo(KategoriPermak, {
  foreignKey: "id_kategori_permak",
  as: "KategoriPermak",
});

// Relasi Keranjang dengan Pelanggan
Pelanggan.hasOne(Keranjang, {
  foreignKey: "id_pelanggan",
  as: "Keranjang",
});

Keranjang.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "Pelanggan",
});

// Untuk Jahit
Keranjang.hasOne(KeranjangPakaian, {
  foreignKey: "id_keranjang",
  as: "KeranjangPakaian",
});

KeranjangPakaian.belongsTo(Keranjang, {
  foreignKey: "id_keranjang",
  as: "Keranjang",
});

KeranjangPakaian.belongsTo(VarianPakaian, {
  foreignKey: "id_varian_pakaian",
  as: "VarianPakaian",
});

// Untuk Permak
Keranjang.hasOne(KeranjangPermak, {
  foreignKey: "id_keranjang",
  as: "KeranjangPermak",
});

KeranjangPermak.belongsTo(Keranjang, {
  foreignKey: "id_keranjang",
  as: "Keranjang",
});

KeranjangPermak.belongsTo(KategoriPermak, {
  foreignKey: "id_kategori_permak",
  as: "KategoriPermak",
});

KeranjangPermak.hasMany(ItemKeranjangPermak, {
  foreignKey: "id_keranjang_permak",
  as: "DetailPermak",
});

ItemKeranjangPermak.belongsTo(KeranjangPermak, {
  foreignKey: "id_keranjang_permak",
  as: "KeranjangPermak",
});

ItemKeranjangPermak.belongsTo(JenisPermak, {
  foreignKey: "id_jenis_permak",
  as: "JenisPermak",
});

ItemKeranjangPermak.belongsTo(InstruksiKhususPermak, {
  foreignKey: "id_instruksi_permak",
  as: "InstruksiPermak",
});

InstruksiKhususPermak.hasOne(ItemKeranjangPermak, {
  foreignKey: "id_instruksi_permak",
  as: "ItemKeranjangPermak",
});

// Relasi Pelanggan dan Pesanan
Pelanggan.hasMany(Pesanan, {
  foreignKey: "id_pelanggan",
  as: "Pesanan",
});

Pesanan.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "PelangganPesanan",
});

// Relasi Status Pesanan
Pesanan.belongsTo(StatusPesanan, {
  foreignKey: "id_status",
  as: "Status",
});

StatusPesanan.hasMany(Pesanan, {
  foreignKey: "id_status",
  as: "Pesanan",
});

// Relasi untuk Jahit
Pesanan.hasOne(PesananPakaian, {
  foreignKey: "id_pesanan",
  as: "PesananPakaian",
});

PesananPakaian.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "Pesanan",
});

PesananPakaian.belongsTo(VarianPakaian, {
  foreignKey: "id_varian_pakaian",
  as: "VarianPakaian",
});

// Relasi untuk Permak
Pesanan.hasMany(PesananPermak, {
  foreignKey: "id_pesanan",
  as: "PesananPermak",
});

PesananPermak.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "Pesanan",
});

// Relasi PesananPermak dan KategoriPermak
PesananPermak.belongsTo(KategoriPermak, {
  foreignKey: "id_kategori_permak",
  as: "KategoriPermak",
});

KategoriPermak.hasMany(PesananPermak, {
  foreignKey: "id_kategori_permak",
  as: "PesananPermak",
});

// Relasi PesananPermak dengan ItemPesananPermak
PesananPermak.hasMany(ItemPesananPermak, {
  foreignKey: "id_pesanan_permak",
  as: "DetailPermak",
});

ItemPesananPermak.belongsTo(PesananPermak, {
  foreignKey: "id_pesanan_permak",
  as: "PesananPermak",
});

// Relasi ItemPesananPermak dengan JenisPermak
ItemPesananPermak.belongsTo(JenisPermak, {
  foreignKey: "id_jenis_permak",
  as: "JenisPermak",
});

ItemPesananPermak.belongsTo(InstruksiKhususPermak, {
  foreignKey: "id_instruksi_permak",
  as: "InstruksiPermak",
});

// Relasi Pengiriman
Pesanan.hasOne(Pengiriman, {
  foreignKey: "id_pesanan",
  as: "Pengiriman",
});

Pengiriman.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "Pesanan",
});

// Relasi Pembayaran
Pesanan.hasOne(Pembayaran, {
  foreignKey: "id_pesanan",
  as: "Pembayaran",
});

Pembayaran.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "Pesanan",
});

// Relasi Riwayat Status
Pesanan.hasMany(RiwayatStatusPesanan, {
  foreignKey: "id_pesanan",
  as: "RiwayatStatus",
});

RiwayatStatusPesanan.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "Pesanan",
});

RiwayatStatusPesanan.belongsTo(StatusPesanan, {
  foreignKey: "id_status_master",
  as: "StatusRiwayat",
});

// Relasi Pelanggan & Alamat
Pelanggan.hasMany(AlamatPelanggan, {
  foreignKey: "id_pelanggan",
  as: "Alamat",
});

AlamatPelanggan.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "Pelanggan",
});

Pengiriman.belongsTo(AlamatPelanggan, {
  foreignKey: "id_alamat_pelanggan",
  as: "Alamat",
});

Pengiriman.belongsTo(AlamatPelanggan, {
  foreignKey: "id_alamat_pickup",
  as: "AlamatPickup",
});

Pengiriman.belongsTo(AlamatPelanggan, {
  foreignKey: "id_alamat_return",
  as: "AlamatReturn",
});

// Relasi Area Pengiriman dengan Alamat Pelanggan
AlamatPelanggan.belongsTo(AreaPengiriman, {
  foreignKey: "area_code",
  targetKey: "kode_area", // karena menggunakan kode_area bukan id
  as: "Area",
});

AreaPengiriman.hasMany(AlamatPelanggan, {
  foreignKey: "area_code",
  sourceKey: "kode_area",
  as: "AlamatPelanggan",
});

module.exports = {
  KategoriPakaian,
  Pakaian,
  GambarPakaian,
  VarianPakaian,
  KategoriPermak,
  JenisPermak,
  Pelanggan,
  AlamatPelanggan,
  Pegawai,
  StatusPesanan,
  Pesanan,
  PesananPermak,
  PesananPakaian,
  ItemPesananPermak,
  RiwayatStatusPesanan,
  Pengiriman,
  Pembayaran,
  AreaPengiriman,
  Keranjang,
  KeranjangPermak,
  KeranjangPakaian,
  ItemKeranjangPermak,
  InstruksiKhususPermak,
};
