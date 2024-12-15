// public/js/pesanan/pakaian-form.js

document.addEventListener("DOMContentLoaded", function () {
  setupCustomerTypeToggle();
  setupFormListeners();
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
        // Aktifkan validasi untuk pelanggan lama
        pelangganSelect.setAttribute("required", "");
        // Reset form pelanggan baru
        newForm.querySelectorAll("input").forEach((input) => {
          input.value = "";
          input.removeAttribute("required");
        });
      } else {
        existingForm.classList.add("d-none");
        newForm.classList.remove("d-none");
        // Nonaktifkan validasi untuk pelanggan lama
        pelangganSelect.removeAttribute("required");
        pelangganSelect.value = "";
        // Aktifkan validasi untuk nama pelanggan baru
        newForm
          .querySelector('[name="nama_pelanggan"]')
          .setAttribute("required", "");
      }
    });
  });
}

// Tambah item pesanan
function addItem() {
  const container = document.getElementById("itemContainer");
  const template = document.getElementById("itemTemplate");
  const noItemMessage = document.getElementById("noItemMessage");

  const newItem = template.content.cloneNode(true);
  const itemCount = container.children.length + 1;

  newItem.querySelector(".item-number").textContent = itemCount;

  container.appendChild(newItem);
  noItemMessage.classList.add("d-none");
  updateTotalBiaya();
}

// Hapus item pesanan
function removeItem(button) {
  const item = button.closest(".item-pakaian");
  const container = document.getElementById("itemContainer");

  item.remove();

  // Update nomor item
  container.querySelectorAll(".item-number").forEach((span, index) => {
    span.textContent = index + 1;
  });

  if (container.children.length === 0) {
    document.getElementById("noItemMessage").classList.remove("d-none");
  }

  updateTotalBiaya();
}

// Update varian pakaian berdasarkan model yang dipilih
async function updateVarianPakaian(selectElement) {
  const id_pakaian = selectElement.value;
  const itemCard = selectElement.closest(".item-pakaian");
  const varianSelect = itemCard.querySelector('[name="id_varian_pakaian"]');
  const hargaElement = itemCard.querySelector(".harga-item");
  const kuantitasInput = itemCard.querySelector('[name="kuantitas"]');

  // Reset dan disable varian select
  varianSelect.innerHTML = '<option value="">Pilih varian</option>';
  varianSelect.disabled = true;

  if (!id_pakaian) {
    hargaElement.textContent = "Rp 0";
    updateTotalBiaya();
    return;
  }

  try {
    const response = await fetch(`/admin/pesanan/pakaian/varian/${id_pakaian}`);
    if (!response.ok) throw new Error("Gagal mengambil data varian");

    const result = await response.json();
    const varianList = result.data;

    // Populate varian options
    varianList.forEach((varian) => {
      const option = document.createElement("option");
      option.value = varian.id_varian_pakaian;
      option.textContent = `${varian.ukuran} - ${varian.warna} (Stok: ${varian.stok})`;
      option.dataset.stok = varian.stok;
      varianSelect.appendChild(option);
    });

    varianSelect.disabled = false;

    // Setup listeners untuk update harga
    varianSelect.onchange = () => updateItemSubtotal(itemCard);
    kuantitasInput.onchange = () => updateItemSubtotal(itemCard);
  } catch (error) {
    console.error("Error:", error);
    varianSelect.innerHTML = '<option value="">Error loading data</option>';
    showAlert("Gagal memuat data varian", "danger");
  }
}

// Update subtotal item dan total keseluruhan
function updateItemSubtotal(itemCard) {
  const pakaianSelect = itemCard.querySelector('[name="id_pakaian"]');
  const kuantitasInput = itemCard.querySelector('[name="kuantitas"]');
  const hargaElement = itemCard.querySelector(".harga-item");

  if (pakaianSelect.value && kuantitasInput.value) {
    const selectedOption = pakaianSelect.options[pakaianSelect.selectedIndex];
    const hargaText = selectedOption.textContent.split(" - Rp ")[1];
    const harga = parseInt(hargaText.replace(/\D/g, "")) || 0;
    const kuantitas = parseInt(kuantitasInput.value) || 0;

    const subtotal = harga * kuantitas;
    hargaElement.textContent = `Rp ${formatNumber(subtotal)}`;
  } else {
    hargaElement.textContent = "Rp 0";
  }

  updateTotalBiaya();
}

// Update total biaya keseluruhan
function updateTotalBiaya() {
  let totalBiaya = 0;
  document.querySelectorAll(".harga-item").forEach((el) => {
    const harga = parseInt(el.textContent.replace(/\D/g, "")) || 0;
    totalBiaya += harga;
  });

  const biayaPengiriman = parseInt(
    document.querySelector('[name="biaya_pengiriman"]')?.value || 0
  );
  const totalPembayaran = totalBiaya + biayaPengiriman;

  document.getElementById("totalBiayaPakaian").textContent = `Rp ${formatNumber(
    totalBiaya
  )}`;
  document.getElementById("biayaPengiriman").textContent = `Rp ${formatNumber(
    biayaPengiriman
  )}`;
  document.getElementById("totalPembayaran").textContent = `Rp ${formatNumber(
    totalPembayaran
  )}`;
}

// Setup form listeners
function setupFormListeners() {
  // Listen for changes in biaya pengiriman
  const biayaPengirimanInput = document.querySelector(
    '[name="biaya_pengiriman"]'
  );
  if (biayaPengirimanInput) {
    biayaPengirimanInput.addEventListener("input", updateTotalBiaya);
  }

  // Listen for form submission
  const form = document.getElementById("pakaianForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  // Setup pickup method toggle
  document.querySelectorAll('[name="pickupMethod"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const shippingForm = document.getElementById("shippingForm");
      const shippingInputs = document.querySelectorAll(".shipping-input");

      if (this.id === "pickup") {
        shippingForm.style.display = "none";
        shippingInputs.forEach((input) => {
          input.removeAttribute("required");
          input.value = "";
        });
        // Set biaya pengiriman ke 0
        document.querySelector('[name="biaya_pengiriman"]').value = "0";
      } else {
        shippingForm.style.display = "block";
        shippingInputs.forEach((input) => input.setAttribute("required", ""));
      }
      updateTotalBiaya();
    });
  });
}

// Handle form submission

async function handleSubmit(event) {
  event.preventDefault();

  try {
    const formData = new FormData(event.target);
    const isPickup = document.getElementById("pickup").checked;

    // Validasi dasar
    if (!validateCustomerStep()) return;

    // Validasi items
    const itemContainer = document.getElementById("itemContainer");
    if (itemContainer.children.length === 0) {
      showAlert("Minimal harus ada satu item pesanan", "danger");
      return;
    }

    const items = Array.from(itemContainer.children).map((itemCard) => {
      const varianSelect = itemCard.querySelector('[name="id_varian_pakaian"]');
      const kuantitasInput = itemCard.querySelector('[name="kuantitas"]');
      const pakaianSelect = itemCard.querySelector('[name="id_pakaian"]');

      return {
        id_pakaian: pakaianSelect.value,
        id_varian_pakaian: varianSelect.value,
        kuantitas: parseInt(kuantitasInput.value) || 1,
      };
    });

    // Tambahkan items ke FormData
    items.forEach((item, index) => {
      formData.append(`items[${index}][id_pakaian]`, item.id_pakaian);
      formData.append(
        `items[${index}][id_varian_pakaian]`,
        item.id_varian_pakaian
      );
      formData.append(`items[${index}][kuantitas]`, item.kuantitas);
    });

    // Jika pickup, tambahkan data default untuk pengiriman
    if (isPickup) {
      formData.set("alamat_jalan", "Ambil di Toko");
      formData.set("kecamatan", "-");
      formData.set("provinsi", "-");
      formData.set("kode_pos", "00000");
      formData.set("jasa_pengiriman", "pickup");
      formData.set("biaya_pengiriman", "0");
    }

    // Tampilkan loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...';

    // Kirim data ke server
    const response = await fetch("/admin/pesanan/pakaian", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat menyimpan pesanan"
      );
    }

    // Tampilkan pesan sukses
    showAlert("Pesanan berhasil disimpan!", "success");

    // Redirect ke halaman detail pesanan setelah 1.5 detik
    setTimeout(() => {
      window.location.href = `/admin/pesanan/${result.data.id_pesanan}`;
    }, 1500);
  } catch (error) {
    console.error("Error:", error);
    showAlert(
      error.message || "Terjadi kesalahan saat menyimpan pesanan",
      "danger"
    );
  } finally {
    // Reset loading state jika terjadi error
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Pesanan';
  }
}

// Tambahkan event listener untuk form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("pakaianForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});

// Fungsi validasi customer
function validateCustomerStep() {
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

// Utility functions
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alert = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
  `;
  alertContainer.innerHTML = alert;
}
