// public/js/pesanan/detail-permak.js

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi alert container
  if (!document.getElementById("alertContainer")) {
    const container = document.createElement("div");
    container.id = "alertContainer";
    container.className = "position-fixed top-0 end-0 p-3";
    container.style.zIndex = "1050";
    document.body.appendChild(container);
  }

  // Tambahkan event listener untuk modal
  const updateStatusModal = document.getElementById("updateStatusModal");
  if (updateStatusModal) {
    updateStatusModal.addEventListener("show.bs.modal", function (event) {
      const currentStatus = document.querySelector(
        'input[name="currentStatus"]'
      ).value;
      const statusSelect = document.getElementById("statusSelect");

      if (statusSelect) {
        statusSelect.addEventListener("change", function () {
          const estimasiField = document.getElementById("estimasiField");
          const penjahitField = document.getElementById("penjahitField");

          // Tampilkan/sembunyikan field berdasarkan status yang dipilih
          if (this.value === "diproses") {
            estimasiField.style.display = "block";
            penjahitField.style.display = "block";
          } else {
            estimasiField.style.display = "none";
            penjahitField.style.display = "none";
          }
        });
      }

      // Reset dropdown
      statusSelect.innerHTML = '<option value="">Pilih Status</option>';

      // Status yang diizinkan berdasarkan status saat ini
      const statusMap = {
        "menunggu pembayaran": {
          next: ["dibatalkan"],
          display: "Menunggu Pembayaran",
        },
        "menunggu konfirmasi pembayaran": {
          next: ["dibatalkan", "diproses"],
          display: "Menunggu Konfirmasi Pembayaran",
        },
        diproses: {
          next: ["dikirim", "selesai"],
          display: "Diproses",
        },
        dikirim: {
          next: ["selesai"],
          display: "Dikirim",
        },
        selesai: {
          next: [],
          display: "Selesai",
        },
        dibatalkan: {
          next: [],
          display: "Dibatalkan",
        },
      };

      // Tambahkan opsi status yang valid
      const validNextStatuses = statusMap[currentStatus]?.next || [];
      validNextStatuses.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = statusMap[status].display;
        statusSelect.appendChild(option);
      });
    });
  }
});

function updateStatus() {
  // Cukup tampilkan modal, event listener akan menangani sisanya
  const modal = new bootstrap.Modal(
    document.getElementById("updateStatusModal")
  );
  modal.show();
}

// Fungsi helper untuk mendapatkan display text status
function getStatusDisplay(status) {
  const statusMap = {
    menunggu_pembayaran: "Menunggu Pembayaran",
    menunggu_konfirmasi: "Menunggu Konfirmasi",
    dibatalkan: "Dibatalkan",
    diproses: "Diproses",
    dikirim: "Dikirim",
    selesai: "Selesai",
  };
  return statusMap[status] || status;
}

function confirmStatusUpdate() {
  const form = document.getElementById("updateStatusForm");
  const newStatus = form.querySelector('[name="status"]').value;
  const catatan = form.querySelector('[name="catatan"]').value;

  if (!newStatus) {
    showAlert("Silakan pilih status baru", "danger");
    return;
  }
  if (!catatan) {
    showAlert("Silakan isi alasan perubahan status", "danger");
    return;
  }

  let warningText = "";
  if (newStatus === "dibatalkan") {
    warningText =
      "Pesanan yang dibatalkan tidak dapat dikembalikan ke status sebelumnya!";
  } else if (newStatus === "selesai") {
    warningText = "Pastikan pesanan benar-benar telah selesai!";
  }

  document.getElementById("warningText").textContent = warningText;
  const confirmationModal = new bootstrap.Modal(
    document.getElementById("confirmationModal")
  );
  confirmationModal.show();
}

async function saveStatus() {
  try {
    const form = document.getElementById("updateStatusForm");
    const data = {
      status: form.querySelector('[name="status"]').value,
      estimasi_selesai: form.querySelector('[name="estimasi_selesai"]').value,
      catatan: form.querySelector('[name="catatan"]').value,
    };

    // Tambahkan nama penjahit ke data jika status diproses
    if (data.status === "diproses") {
      const namaPenjahit = form.querySelector('[name="nama_penjahit"]')?.value;
      if (namaPenjahit) {
        data.nama_penjahit = namaPenjahit;
      }
    }

    const pesananId = form.querySelector('[name="pesananId"]').value;

    const response = await fetch(`/admin/pesanan/${pesananId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate status");
    }

    // Hide modals
    const confirmModal = bootstrap.Modal.getInstance(
      document.getElementById("confirmationModal")
    );
    const updateModal = bootstrap.Modal.getInstance(
      document.getElementById("updateStatusModal")
    );

    if (confirmModal) confirmModal.hide();
    if (updateModal) updateModal.hide();

    showAlert("Status pesanan berhasil diperbarui", "success");
    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    console.error("Error:", error);
    showAlert(error.message, "danger");
  }
}

// Payment Handler Functions
function validatePayment(imgSrc) {
  const modal = new bootstrap.Modal(
    document.getElementById("paymentValidationModal")
  );
  document.getElementById("paymentProofPreview").src = imgSrc;
  modal.show();
}

async function savePaymentValidation() {
  try {
    const form = document.getElementById("paymentValidationForm");
    const data = {
      status_pembayaran: form.querySelector('[name="status_pembayaran"]').value,
      catatan: form.querySelector('[name="catatan"]').value,
    };

    const pesananId = form.querySelector('[name="id_pesanan"]').value;

    const response = await fetch(`/admin/pesanan/${pesananId}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memvalidasi pembayaran");
    }

    bootstrap.Modal.getInstance(
      document.getElementById("paymentValidationModal")
    ).hide();
    showAlert("Status pembayaran berhasil diperbarui", "success");
    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

// Utility Functions
function viewImage(src) {
  const modal = new bootstrap.Modal(document.getElementById("imageModal"));
  const previewImage = document.getElementById("previewImage");
  previewImage.src = src;
  modal.show();
}

function printOrder() {
  let printContents = document.querySelector(".container-fluid").innerHTML;
  let originalContents = document.body.innerHTML;

  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = printContents;

  tempDiv.querySelectorAll("button").forEach((button) => button.remove());
  tempDiv.querySelectorAll(".modal").forEach((modal) => modal.remove());

  let printStyles = `
    <style>
      @media print {
        body { padding: 20px; }
        .btn, .modal { display: none !important; }
        .card { border: 1px solid #ddd; margin-bottom: 20px; }
        .badge { border: 1px solid #000; }
        img { max-width: 300px; }
      }
    </style>
  `;

  document.body.innerHTML = printStyles + tempDiv.innerHTML;
  window.print();
  document.body.innerHTML = originalContents;
  location.reload();
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHTML;

  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      alert.classList.remove("show");
      setTimeout(() => alert.remove(), 150);
    }
  }, 5000);
}

function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}
