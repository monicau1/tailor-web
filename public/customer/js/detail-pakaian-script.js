// public/js/detail-pakaian-script.js

document.addEventListener("DOMContentLoaded", function () {
  // Get all required elements
  const form = document.getElementById("formPakaian");
  const ukuranSelect = document.querySelector('select[name="ukuran"]');
  const warnaSelect = document.querySelector('select[name="warna"]');
  const quantityInput = document.getElementById("quantity");
  const decrementBtn = document.getElementById("decrementBtn");
  const incrementBtn = document.getElementById("incrementBtn");
  const submitBtn = document.querySelector('button[type="submit"]');
  const customSizeCheckbox = document.getElementById("customSize");
  const customSizeForm = document.getElementById("customSizeForm");
  const stokInfo = document.getElementById("stokInfo");

  // Function to check stock
  async function checkStock() {
    if (!ukuranSelect || !warnaSelect || !stokInfo) return;

    const ukuran = ukuranSelect.value;
    const warna = warnaSelect.value;

    // Reset state
    submitBtn.disabled = true;
    stokInfo.innerHTML = "";

    // If using custom size, enable submit
    if (customSizeCheckbox?.checked) {
      stokInfo.innerHTML =
        '<div class="alert alert-info">Menggunakan ukuran khusus</div>';
      submitBtn.disabled = false;
      return;
    }

    // Check stock if size and color are selected
    if (ukuran && warna) {
      try {
        const response = await fetch(
          `/pakaian/check-stock/${form.dataset.idPakaian}?ukuran=${ukuran}&warna=${warna}`
        );
        const data = await response.json();

        if (data.stok > 0) {
          stokInfo.innerHTML = `<div class="alert alert-success">Stok tersedia: ${data.stok}</div>`;
          submitBtn.disabled = false;
          quantityInput.max = data.stok;

          // Reset quantity if it's more than available stock
          if (parseInt(quantityInput.value) > data.stok) {
            quantityInput.value = data.stok;
          }
        } else {
          stokInfo.innerHTML =
            '<div class="alert alert-warning">Stok tidak tersedia</div>';
          submitBtn.disabled = true;
        }
      } catch (error) {
        console.error("Error checking stock:", error);
        stokInfo.innerHTML =
          '<div class="alert alert-danger">Gagal mengecek stok</div>';
        submitBtn.disabled = true;
      }
    }
  }

  // Handle size and color changes
  ukuranSelect?.addEventListener("change", checkStock);
  warnaSelect?.addEventListener("change", checkStock);

  // Handle custom size toggle
  customSizeCheckbox?.addEventListener("change", function () {
    if (!customSizeForm) return;

    customSizeForm.classList.toggle("d-none", !this.checked);

    if (ukuranSelect) {
      ukuranSelect.disabled = this.checked;
      ukuranSelect.required = !this.checked;
    }

    if (warnaSelect) {
      warnaSelect.required = !this.checked;
    }

    // Update stock info and submit button
    checkStock();

    // Reset and disable regular size fields if using custom size
    if (this.checked) {
      ukuranSelect.value = "";
      warnaSelect.value = "";
    }
  });

  // Handle quantity controls
  if (decrementBtn && quantityInput) {
    decrementBtn.addEventListener("click", () => {
      const currentVal = parseInt(quantityInput.value);
      if (currentVal > 1) {
        quantityInput.value = currentVal - 1;
      }
    });
  }

  if (incrementBtn && quantityInput) {
    incrementBtn.addEventListener("click", () => {
      const currentVal = parseInt(quantityInput.value);
      const max = parseInt(quantityInput.max || Infinity);
      if (currentVal < max) {
        quantityInput.value = currentVal + 1;
      }
    });
  }

  // Validate quantity input directly
  quantityInput?.addEventListener("change", () => {
    let value = parseInt(quantityInput.value);
    const max = parseInt(quantityInput.max || Infinity);
    const min = 1;

    if (isNaN(value) || value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    quantityInput.value = value;
  });

  // Form validation and submission
  form?.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate required fields based on selection
    if (customSizeCheckbox?.checked) {
      // Validate custom size fields
      const requiredFields = [
        "ukuran_dada",
        "ukuran_pinggang",
        "panjang_tubuh",
      ];

      const missingFields = requiredFields.filter((field) => {
        const input = form.querySelector(`[name="${field}"]`);
        return input && !input.value;
      });

      if (missingFields.length > 0) {
        alert("Silakan lengkapi ukuran khusus yang diperlukan");
        return;
      }
    } else {
      // Validate regular size fields
      if (!ukuranSelect?.value || !warnaSelect?.value) {
        alert("Silakan pilih ukuran dan warna");
        return;
      }
    }

    // Log form data for debugging
    const formData = new FormData(form);
    console.log("Submitting form data:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Submit form
    form.submit();
  });

  // Initial stock check
  checkStock();
});
