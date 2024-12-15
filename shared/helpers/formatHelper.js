// shared/helpers/formatHelper.js
exports.formatNumber = (number) => {
  return new Intl.NumberFormat("id-ID").format(number || 0);
};

exports.formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

exports.formatTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

exports.formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tambahkan fungsi formatStatus
exports.formatStatus = (status) => {
  const statusMap = {
    "menunggu pembayaran": "Menunggu Pembayaran",
    "menunggu konfirmasi pembayaran": "Menunggu Konfirmasi",
    diproses: "Dalam Proses",
    dikirim: "Dalam Pengiriman",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  return statusMap[status] || status;
};

exports.formatDateValue = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};
