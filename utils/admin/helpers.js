// utils/helpers.js (ini admin website)

// Format tanggal lengkap dengan waktu
exports.formatDateTime = (date) => {
  if (!date) return "-";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};

// Format tanggal saja
exports.formatDate = (date) => {
  if (!date) return "-";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("id-ID", options);
};

// Format waktu saja
exports.formatTime = (date) => {
  if (!date) return "-";
  const options = { hour: "2-digit", minute: "2-digit" };
  return new Date(date).toLocaleTimeString("id-ID", options);
};

// Format angka ke format rupiah
exports.formatNumber = (number) => {
  if (!number) return "0";
  return new Intl.NumberFormat("id-ID").format(number);
};

// Format status pesanan
exports.formatStatus = (status) => {
  const statusMap = {
    "menunggu pembayaran": "Menunggu Pembayaran",
    "menunggu konfirmasi pembayaran": "Menunggu Konfirmasi Pembayaran",
    diproses: "Dalam Proses",
    dikirim: "Dalam Pengiriman",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  return statusMap[status] || status;
};

// Format status pembayaran
exports.formatPaymentStatus = (status) => {
  const statusMap = {
    pending: "Belum Dibayar",
    paid: "Sudah Dibayar",
    failed: "Gagal",
  };
  return statusMap[status] || status;
};

// Format tanggal untuk input date HTML
exports.formatDateValue = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

// Format warna status
exports.getStatusColor = (status) => {
  const statusMap = {
    "menunggu pembayaran": "warning",
    "menunggu konfirmasi pembayaran": "warning",
    diproses: "info",
    dikirim: "primary",
    selesai: "success",
    dibatalkan: "danger",
  };
  return statusMap[status] || "secondary";
};
