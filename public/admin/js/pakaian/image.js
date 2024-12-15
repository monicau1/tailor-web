// Get product ID dari halaman
const PRODUCT_ID = document.querySelector("#productId")?.value;

document.addEventListener("DOMContentLoaded", function () {
  const imageUploadForm = document.getElementById("imageUploadForm");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const uploadProgress = document.getElementById("uploadProgress");
  const progressBar = uploadProgress.querySelector(".progress-bar");

  imageUploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!PRODUCT_ID) {
      alert("ID Produk tidak ditemukan!");
      return;
    }

    const formData = new FormData();
    const fileInput = document.getElementById("productImages");
    const files = fileInput.files;

    if (files.length === 0) {
      alert("Pilih file gambar terlebih dahulu!");
      return;
    }

    // Tambahkan semua file ke FormData
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      uploadProgress.classList.remove("d-none");
      progressBar.style.width = "0%";

      const response = await fetch(`/admin/pakaian/${PRODUCT_ID}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload gagal");
      }

      const result = await response.json();

      // Refresh halaman untuk menampilkan gambar baru
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengupload gambar: " + error.message);
    } finally {
      uploadProgress.classList.add("d-none");
      imageUploadForm.reset();
    }
  });
});

// Fungsi untuk menghapus gambar
async function deleteImage(imageId) {
  if (!PRODUCT_ID) {
    alert("ID Produk tidak ditemukan!");
    return;
  }

  try {
    // Konfirmasi penghapusan
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      return;
    }

    // Tampilkan loading state
    const deleteButton = document.querySelector(
      `button[onclick="deleteImage('${imageId}')"]`
    );
    const originalContent = deleteButton.innerHTML;
    deleteButton.disabled = true;
    deleteButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

    const response = await fetch(
      `/admin/pakaian/${PRODUCT_ID}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menghapus gambar");
    }

    // Hapus elemen gambar dari DOM
    const imageContainer = deleteButton.closest(".col-md-3");
    if (imageContainer) {
      imageContainer.remove();
    }

    // Tampilkan pesan sukses
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-success alert-dismissible fade show";
    alertDiv.innerHTML = `
      ${result.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document
      .querySelector(".card-body")
      .insertBefore(alertDiv, document.querySelector("#imagePreviewContainer"));

    // Hilangkan alert setelah 3 detik
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal menghapus gambar: " + error.message);

    // Kembalikan button ke kondisi semula
    const deleteButton = document.querySelector(
      `button[onclick="deleteImage('${imageId}')"]`
    );
    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.innerHTML = '<i class="fas fa-times"></i>';
    }
  }
}

// Fungsi untuk set gambar utama
async function setPrimaryImage(imageId) {
  if (!PRODUCT_ID) {
    alert("ID Produk tidak ditemukan!");
    return;
  }

  try {
    const response = await fetch(
      `/admin/pakaian/${PRODUCT_ID}/images/${imageId}/primary`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengatur gambar utama");
    }

    // Refresh halaman
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mengatur gambar utama: " + error.message);
  }
}
