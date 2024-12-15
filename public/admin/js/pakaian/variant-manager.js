class VariantManager {
  constructor() {
    this.variants = [];
    this.variantForm = document.getElementById("variantForm");
    this.variantTable = document
      .getElementById("variantTable")
      ?.getElementsByTagName("tbody")[0];
    this.emptyVariantMessage = document.getElementById("emptyVariant");

    this.initializeEventListeners();
    this.loadExistingVariants();
  }

  initializeEventListeners() {
    // Form submit untuk tambah varian
    this.variantForm?.addEventListener("submit", (e) =>
      this.handleAddVariant(e)
    );
  }

  loadExistingVariants() {
    const existingRows = this.variantTable?.getElementsByTagName("tr");
    if (!existingRows || existingRows.length === 0) {
      this.toggleEmptyMessage(true);
      return;
    }

    Array.from(existingRows).forEach((row) => {
      const variantId = row.dataset.variantId;
      if (!variantId) return;

      const stockInput = row.querySelector(".stock-input");

      this.variants.push({
        id: variantId,
        ukuran: row.cells[1].textContent.trim(),
        warna: row.cells[2].textContent.trim(),
        stok: stockInput ? parseInt(stockInput.value) : 0,
      });
    });

    // Setup stock controls
    document.querySelectorAll(".stock-input").forEach((input) => {
      const row = input.closest("tr");
      this.initializeStockControls(input, row);
    });

    this.toggleEmptyMessage(this.variants.length === 0);
  }

  handleAddVariant(e) {
    e.preventDefault();

    const size = document.getElementById("variantSize")?.value;
    const color = document.getElementById("variantColor")?.value;
    const stock = parseInt(
      document.getElementById("variantStock")?.value || "0"
    );

    // Validasi input
    if (!size || !color) {
      this.showAlert("danger", "Ukuran dan warna harus diisi");
      return;
    }

    // Cek duplikasi
    const isDuplicate = this.variants.some(
      (v) => v.ukuran === size && v.warna === color
    );

    if (isDuplicate) {
      this.showAlert("danger", "Kombinasi ukuran dan warna sudah ada");
      return;
    }

    this.variants.push({
      ukuran: size,
      warna: color,
      stok: stock,
    });

    this.updateVariantTable();
    this.variantForm?.reset();
    this.showAlert("success", "Varian berhasil ditambahkan");
  }

  async removeVariant(index) {
    const variant = this.variants[index];

    if (!variant) return;

    if (confirm("Anda yakin ingin menghapus varian ini?")) {
      if (variant.id) {
        try {
          const response = await fetch(`/admin/pakaian/variant/${variant.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          const result = await response.json();

          if (result.status === "error") {
            this.showAlert("danger", result.message);
            return;
          }
        } catch (error) {
          console.error("Error:", error);
          this.showAlert("danger", "Gagal menghapus varian");
          return;
        }
      }

      this.variants.splice(index, 1);
      this.updateVariantTable();
      this.showAlert("success", "Varian berhasil dihapus");
    }
  }

  updateVariantTable() {
    if (!this.variantTable) return;

    this.variantTable.innerHTML = "";
    this.toggleEmptyMessage(this.variants.length === 0);

    this.variants.forEach((variant, index) => {
      const row = this.variantTable.insertRow();
      if (variant.id) {
        row.dataset.variantId = variant.id;
      }

      row.innerHTML = `
          <td class="text-center">${index + 1}</td>
          <td>${variant.ukuran}</td>
          <td>${variant.warna}</td>
          <td>
            <div class="input-group input-group-sm" style="width: 120px;">
              <button class="btn btn-outline-secondary decrease-stock" type="button">-</button>
              <input type="number" class="form-control text-center stock-input" 
                     value="${variant.stok}" min="0" 
                     data-original="${variant.stok}">
              <button class="btn btn-outline-secondary increase-stock" type="button">+</button>
            </div>
          </td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-success save-stock" style="display: none;">
                <i class="fas fa-check"></i>
              </button>
              <button type="button" class="btn btn-secondary cancel-stock" style="display: none;">
                <i class="fas fa-times"></i>
              </button>
              <button type="button" class="btn btn-danger delete-variant" onclick="variantManager.removeVariant(${index})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;

      const stockInput = row.querySelector(".stock-input");
      if (stockInput) {
        this.initializeStockControls(stockInput, row);
      }
    });
  }

  initializeStockControls(input, row) {
    const saveBtn = row.querySelector(".save-stock");
    const cancelBtn = row.querySelector(".cancel-stock");
    const decreaseBtn = row.querySelector(".decrease-stock");
    const increaseBtn = row.querySelector(".increase-stock");
    const variantId = row.dataset.variantId;

    const checkChanges = () => {
      const originalValue = parseInt(input.dataset.original);
      const currentValue = parseInt(input.value);
      const hasChanged = originalValue !== currentValue;

      saveBtn.style.display = hasChanged ? "inline-block" : "none";
      cancelBtn.style.display = hasChanged ? "inline-block" : "none";
    };

    decreaseBtn?.addEventListener("click", () => {
      const currentValue = parseInt(input.value);
      if (currentValue > 0) {
        input.value = currentValue - 1;
        checkChanges();
      }
    });

    increaseBtn?.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
      checkChanges();
    });

    input.addEventListener("input", () => {
      if (parseInt(input.value) < 0) input.value = 0;
      checkChanges();
    });

    saveBtn?.addEventListener("click", async () => {
      const newStock = parseInt(input.value);
      const index = Array.from(row.parentNode.children).indexOf(row);

      if (variantId) {
        const success = await this.updateStock(variantId, newStock);
        if (success) {
          this.variants[index].stok = newStock;
          input.dataset.original = newStock;
          saveBtn.style.display = "none";
          cancelBtn.style.display = "none";
        }
      }
    });

    cancelBtn?.addEventListener("click", () => {
      input.value = input.dataset.original;
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
    });
  }

  async updateStock(variantId, newStock) {
    try {
      const response = await fetch(
        `/admin/pakaian/variant/${variantId}/stock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: newStock }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        this.showAlert("success", "Stok berhasil diperbarui");
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      this.showAlert("danger", "Gagal memperbarui stok");
      return false;
    }
  }

  toggleEmptyMessage(show) {
    if (this.emptyVariantMessage) {
      this.emptyVariantMessage.style.display = show ? "block" : "none";
    }
  }

  showAlert(type, message) {
    const alertContainer = document.createElement("div");
    alertContainer.className = "alert-container position-fixed top-0 end-0 p-3";
    alertContainer.style.zIndex = "1050";

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

    alertContainer.appendChild(alert);
    document.body.appendChild(alertContainer);

    setTimeout(() => {
      alert.classList.remove("show");
      setTimeout(() => alertContainer.remove(), 150);
    }, 3000);
  }

  getVariants() {
    return this.variants.map((variant) => ({
      ...(variant.id ? { id_varian_pakaian: variant.id } : {}),
      ukuran: variant.ukuran,
      warna: variant.warna,
      stok: variant.stok,
    }));
  }
}

// Initialize manager
const variantManager = new VariantManager();
window.variantManager = variantManager;
