// public/js/pakaian/create.js

// DOM elements
const productForm = document.getElementById("productForm");

function showLoadingState(isLoading) {
  const submitButton = productForm.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...';
  } else {
    submitButton.disabled = false;
    submitButton.innerHTML = "Simpan";
  }
}

async function saveProduct(e) {
  e.preventDefault();

  // Get variants from variantManager
  const variants = variantManager.getVariants();

  if (variants.length === 0) {
    alert("Minimal harus menambahkan satu varian produk!");
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

    const response = await fetch("/admin/pakaian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    alert(
      "Produk berhasil ditambahkan! Anda akan diarahkan ke halaman edit untuk menambahkan gambar."
    );
    window.location.href = `/admin/pakaian/${result.data.id_pakaian}`;
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  } finally {
    showLoadingState(false);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  productForm.addEventListener("submit", saveProduct);
});
