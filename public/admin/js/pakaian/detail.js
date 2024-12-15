// public/js/pakaian/detail.js

// DOM elements
const productForm = document.getElementById("productForm");
const deleteButton = document.getElementById("deleteProduct");
const productId = document.getElementById("productId").value;

async function updateProduct(e) {
  e.preventDefault();

  // Get variants from variantManager
  const variants = variantManager.getVariants();

  if (variants.length === 0) {
    alert("Minimal harus ada satu varian produk!");
    return;
  }

  const formData = {
    nama_pakaian: document.getElementById("productName").value,
    deskripsi_pakaian: document.getElementById("productDescription").value,
    harga: parseFloat(document.getElementById("productPrice").value),
    id_kategori_pakaian: parseInt(document.getElementById("category").value),
    berat: parseFloat(document.getElementById("weight").value) || null,
    status_produk: document.getElementById("status").value,
    varian_pakaian: variants,
  };

  try {
    showLoadingState(true);
    const response = await fetch(`/admin/pakaian/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate produk");
    }

    alert("Produk berhasil diperbarui!");
    window.location.reload();
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  } finally {
    showLoadingState(false);
  }
}

async function deleteProduct() {
  if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    return;
  }

  try {
    const response = await fetch(`/admin/pakaian/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menghapus produk");
    }

    alert("Produk berhasil dihapus!");
    window.location.href = "/admin/pakaian";
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  }
}

// Validation functions
function validatePrice(price) {
  return !isNaN(price) && price > 0;
}

function showLoadingState(isLoading) {
  const submitButton = productForm.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  } else {
    submitButton.disabled = false;
    submitButton.innerHTML = "Update Product";
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  productForm.addEventListener("submit", updateProduct);
  deleteButton.addEventListener("click", deleteProduct);

  // Form validation listeners
  document.getElementById("productPrice").addEventListener("input", (e) => {
    const price = parseFloat(e.target.value);
    if (!validatePrice(price)) {
      e.target.classList.add("is-invalid");
    } else {
      e.target.classList.remove("is-invalid");
    }
  });
});
