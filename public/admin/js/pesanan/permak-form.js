// public/js/pesanan/permak-form.js

document.addEventListener("DOMContentLoaded", function () {
  setupCustomerTypeToggle();
  setupPickupMethodToggle();
  setupPaymentHandlers();
  setupFormSubmit();
});

// Toggle antara pelanggan baru dan lama
function setupCustomerTypeToggle() {
  const existingForm = document.getElementById("existingCustomerForm");
  const newForm = document.getElementById("newCustomerForm");
  const pelangganSelect = document.querySelector('[name="id_pelanggan"]');

  document.querySelectorAll('[name="customerType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.id === "existingCustomer") {
        existingForm.classList.remove("d-none");
        newForm.classList.add("d-none");
        pelangganSelect.setAttribute("required", "");
        // Reset form pelanggan baru
        newForm.querySelectorAll("input").forEach((input) => {
          input.value = "";
          input.removeAttribute("required");
        });
      } else {
        existingForm.classList.add("d-none");
        newForm.classList.remove("d-none");
        pelangganSelect.removeAttribute("required");
        pelangganSelect.value = "";
        newForm
          .querySelector('[name="nama_pelanggan"]')
          .setAttribute("required", "");
      }
    });
  });
}

// Manajemen Pakaian
function addPakaian() {
  const container = document.getElementById("pakaianContainer");
  const template = document.getElementById("pakaianTemplate");
  const noItemMessage = document.getElementById("noPakaianMessage");

  const newItem = template.content.cloneNode(true);
  const itemCount = container.children.length + 1;

  newItem.querySelector(".pakaian-number").textContent = itemCount;

  container.appendChild(newItem);
  noItemMessage.classList.add("d-none");
  updateTotalBiaya();
}

function removePakaian(button) {
  const pakaianItem = button.closest(".pakaian-item");
  const container = document.getElementById("pakaianContainer");

  pakaianItem.remove();

  // Update nomor pakaian
  container.querySelectorAll(".pakaian-number").forEach((span, index) => {
    span.textContent = index + 1;
  });

  if (container.children.length === 0) {
    document.getElementById("noPakaianMessage").classList.remove("d-none");
  }

  updateTotalBiaya();
}

// Manajemen Permak
function addPermak(button) {
  const pakaianItem = button.closest(".pakaian-item");
  const permakContainer = pakaianItem.querySelector(".permak-container");
  const template = document.getElementById("permakTemplate");
  const noPermakMessage = pakaianItem.querySelector(".no-permak-message");

  const newPermak = template.content.cloneNode(true);
  permakContainer.appendChild(newPermak);
  noPermakMessage.classList.add("d-none");

  updateSubtotalPakaian(pakaianItem);
}

function removePermak(button) {
  const permakItem = button.closest(".permak-item");
  const pakaianItem = button.closest(".pakaian-item");
  const permakContainer = pakaianItem.querySelector(".permak-container");

  permakItem.remove();

  if (permakContainer.children.length === 0) {
    pakaianItem.querySelector(".no-permak-message").classList.remove("d-none");
  }

  updateSubtotalPakaian(pakaianItem);
}

// Update jenis permak berdasarkan kategori
async function updateJenisPermak(selectElement) {
  const pakaianItem = selectElement.closest(".pakaian-item");
  const permakItem = selectElement.closest(".permak-item");
  const jenisSelect = permakItem.querySelector('[name="jenis_permak[]"]');

  jenisSelect.innerHTML = '<option value="">Loading...</option>';
  jenisSelect.disabled = true;

  try {
    const kategoriId = selectElement.value;
    if (!kategoriId) {
      jenisSelect.innerHTML = '<option value="">Pilih jenis permak</option>';
      jenisSelect.disabled = true;
      return;
    }

    const response = await fetch(
      `/admin/pesanan/permak/kategori/${kategoriId}/jenis`
    );
    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    // Populate jenis permak options
    jenisSelect.innerHTML = '<option value="">Pilih jenis permak</option>';
    result.data.forEach((jenis) => {
      const option = new Option(
        `${jenis.nama_permak} - Rp ${formatNumber(jenis.harga)}`,
        jenis.id_jenis_permak
      );
      option.dataset.harga = jenis.harga;
      jenisSelect.add(option);
    });

    jenisSelect.disabled = false;
    jenisSelect.addEventListener("change", () =>
      updateSubtotalPakaian(pakaianItem)
    );
  } catch (error) {
    console.error("Error:", error);
    jenisSelect.innerHTML = '<option value="">Error loading data</option>';
    showAlert("Gagal memuat data jenis permak", "danger");
  }
}

// Update subtotal untuk satu pakaian
function updateSubtotalPakaian(pakaianItem) {
  let subtotal = 0;

  // Hitung total dari semua permak dalam satu pakaian
  pakaianItem.querySelectorAll('[name="jenis_permak[]"]').forEach((select) => {
    if (select.value) {
      const selectedOption = select.options[select.selectedIndex];
      const harga = parseFloat(selectedOption.dataset.harga) || 0;
      subtotal += harga;
    }
  });

  pakaianItem.querySelector(
    ".subtotal-pakaian"
  ).textContent = `Rp ${formatNumber(subtotal)}`;

  updateTotalBiaya();
}

// Update total keseluruhan
function updateTotalBiaya() {
  let totalBiayaPermak = 0;

  // Hitung total dari semua pakaian
  document.querySelectorAll(".subtotal-pakaian").forEach((el) => {
    const harga = parseInt(el.textContent.replace(/\D/g, "")) || 0;
    totalBiayaPermak += harga;
  });

  const biayaPengiriman = parseInt(
    document.querySelector('[name="biaya_pengiriman"]')?.value || 0
  );
  const totalPembayaran = totalBiayaPermak + biayaPengiriman;

  // Update tampilan
  document.getElementById("totalBiayaPermak").textContent = `Rp ${formatNumber(
    totalBiayaPermak
  )}`;
  document.getElementById("biayaPengiriman").textContent = `Rp ${formatNumber(
    biayaPengiriman
  )}`;
  document.getElementById("totalPembayaran").textContent = `Rp ${formatNumber(
    totalPembayaran
  )}`;
}

// Toggle pengiriman
function setupPickupMethodToggle() {
  const deliveryForm = document.getElementById("deliveryForm");
  const shippingInputs = deliveryForm.querySelectorAll("input, select");

  document.querySelectorAll('[name="pickupMethod"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.id === "pickup") {
        deliveryForm.classList.add("d-none");
        shippingInputs.forEach((input) => {
          input.value = "";
          input.removeAttribute("required");
        });
        document.querySelector('[name="biaya_pengiriman"]').value = "0";
      } else {
        deliveryForm.classList.remove("d-none");
        shippingInputs.forEach((input) => {
          if (input.name !== "biaya_pengiriman") {
            input.setAttribute("required", "");
          }
        });
      }
      updateTotalBiaya();
    });
  });
}

// Setup pembayaran
function setupPaymentHandlers() {
  const statusPembayaran = document.querySelector('[name="status_pembayaran"]');
  const buktiPembayaran = document.querySelector('[name="bukti_pembayaran"]');

  if (statusPembayaran && buktiPembayaran) {
    statusPembayaran.addEventListener("change", function () {
      if (this.value === "paid") {
        buktiPembayaran.setAttribute("required", "");
      } else {
        buktiPembayaran.removeAttribute("required");
      }
    });
  }
}

// Handle form submission
function setupFormSubmit() {
  const form = document.getElementById("permakForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData(this);
    const submitButton = form.querySelector('button[type="submit"]');

    try {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

      const response = await fetch("/admin/pesanan/permak", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showAlert("Pesanan berhasil dibuat!", "success");

      setTimeout(() => {
        window.location.href = `/admin/pesanan/${result.data.id_pesanan}`;
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      showAlert(error.message, "danger");
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-save"></i> Simpan Pesanan';
    }
  });
}

// Validasi form
function validateForm() {
  // Validasi pelanggan
  if (!validateCustomerData()) return false;

  // Validasi pakaian dan permak
  if (!validatePakaianData()) return false;

  // Validasi pengiriman
  if (!validateShippingData()) return false;

  // Validasi pembayaran
  if (!validatePaymentData()) return false;

  return true;
}

function validateCustomerData() {
  const isNewCustomer = document.getElementById("newCustomer").checked;

  if (isNewCustomer) {
    const nama = document.querySelector('[name="nama_pelanggan"]').value;
    if (!nama) {
      showAlert("Nama pelanggan wajib diisi!", "danger");
      return false;
    }
  } else {
    const pelangganId = document.querySelector('[name="id_pelanggan"]').value;
    if (!pelangganId) {
      showAlert("Silakan pilih pelanggan!", "danger");
      return false;
    }
  }
  return true;
}

function validatePakaianData() {
  const pakaianItems = document.querySelectorAll(".pakaian-item");
  if (pakaianItems.length === 0) {
    showAlert("Minimal harus ada satu pakaian!", "danger");
    return false;
  }

  for (const pakaian of pakaianItems) {
    const permakItems = pakaian.querySelectorAll(".permak-item");
    if (permakItems.length === 0) {
      showAlert(
        "Setiap pakaian harus memiliki minimal satu jenis permak!",
        "danger"
      );
      return false;
    }
  }

  return true;
}

function validateShippingData() {
  const isPickup = document.getElementById("pickup").checked;
  if (!isPickup) {
    const required = [
      "alamat_jalan",
      "kecamatan",
      "provinsi",
      "kode_pos",
      "jasa_pengiriman",
    ];
    for (const field of required) {
      const input = document.querySelector(`[name="${field}"]`);
      if (!input.value) {
        showAlert("Semua data pengiriman wajib diisi!", "danger");
        return false;
      }
    }
  }
  return true;
}

function validatePaymentData() {
  const metodePembayaran = document.querySelector(
    '[name="metode_pembayaran"]'
  ).value;
  const statusPembayaran = document.querySelector(
    '[name="status_pembayaran"]'
  ).value;

  if (!metodePembayaran || !statusPembayaran) {
    showAlert("Metode dan status pembayaran wajib dipilih!", "danger");
    return false;
  }

  return true;
}

// Utility functions
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHTML;

  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }
  }, 5000);
}
