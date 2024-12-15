// project-skripsi/shared/helpers/orderHelper.js

// shared/helpers/orderHelper.js

// Status pesanan
const ORDER_STATUS = {
  STATUS_CODES: {
    menunggu_konfirmasi: 1,
    dikonfirmasi: 2,
    dalam_proses: 3,
    siap_dikirim: 4,
    sedang_dikirim: 5,
    telah_diterima: 6,
    selesai: 7,
    dibatalkan: 8,
  },

  STATUS_COLORS: {
    menunggu_konfirmasi: "warning",
    dikonfirmasi: "info",
    dalam_proses: "primary",
    siap_dikirim: "info",
    sedang_dikirim: "primary",
    telah_diterima: "success",
    selesai: "success",
    dibatalkan: "danger",
  },

  STATUS_DISPLAY: {
    menunggu_konfirmasi: "Menunggu Konfirmasi",
    dikonfirmasi: "Dikonfirmasi",
    dalam_proses: "Dalam Proses",
    siap_dikirim: "Siap Dikirim",
    sedang_dikirim: "Sedang Dikirim",
    telah_diterima: "Telah Diterima",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  },

  getStatusColor(status) {
    return this.STATUS_COLORS[status] || "secondary";
  },

  getStatusDisplay(status) {
    return this.STATUS_DISPLAY[status] || status;
  },
};

// Status pembayaran
const PAYMENT_STATUS = {
  STATUS_CODES: {
    pending: 1,
    paid: 2,
    failed: 3,
  },

  STATUS_COLORS: {
    pending: "warning",
    paid: "success",
    failed: "danger",
  },

  STATUS_DISPLAY: {
    pending: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    failed: "Gagal",
  },

  getStatusColor(status) {
    return this.STATUS_COLORS[status] || "secondary";
  },

  getStatusDisplay(status) {
    return this.STATUS_DISPLAY[status] || status;
  },
};

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
};
