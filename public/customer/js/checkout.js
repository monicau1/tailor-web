// Tambahkan ke file public/js/checkout.js

function validateCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  const requiredFields = [
    "nama_penerima",
    "telepon_penerima",
    "area",
    "alamat_lengkap",
    "kode_pos",
    "metode_pembayaran",
  ];

  let isValid = true;
  const errorMessages = [];

  requiredFields.forEach((field) => {
    const input = form.elements[field];
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add("is-invalid");
      errorMessages.push(`${field.replace(/_/g, " ")} harus diisi`);
    } else {
      input.classList.remove("is-invalid");
    }
  });

  // Validasi format telepon
  const telepon = form.elements["telepon_penerima"].value;
  if (telepon && !/^[0-9]{10,13}$/.test(telepon)) {
    isValid = false;
    form.elements["telepon_penerima"].classList.add("is-invalid");
    errorMessages.push("Nomor telepon tidak valid");
  }

  // Validasi kode pos
  const kodePos = form.elements["kode_pos"].value;
  if (kodePos && !/^[0-9]{5}$/.test(kodePos)) {
    isValid = false;
    form.elements["kode_pos"].classList.add("is-invalid");
    errorMessages.push("Kode pos harus 5 digit");
  }

  if (!isValid) {
    showErrorAlert(errorMessages);
    return false;
  }

  return true;
}

function showErrorAlert(messages) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-danger alert-dismissible fade show";
  alertDiv.innerHTML = `
      <strong>Mohon perbaiki kesalahan berikut:</strong>
      <ul class="mb-0">
        ${messages.map((msg) => `<li>${msg}</li>`).join("")}
      </ul>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  const form = document.getElementById("checkoutForm");
  form.insertBefore(alertDiv, form.firstChild);
}

// Tambahkan event listener
document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (e) {
    if (!validateCheckoutForm()) {
      e.preventDefault();
    }
  });
