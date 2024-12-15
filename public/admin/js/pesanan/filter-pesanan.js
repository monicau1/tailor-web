document.addEventListener("DOMContentLoaded", function () {
  // Handle date range filter
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");

  startDate.addEventListener("change", function () {
    if (this.value) {
      endDate.setAttribute("min", this.value);
    } else {
      endDate.removeAttribute("min");
    }
    // Auto submit saat tanggal awal dipilih
    document.getElementById("filterForm").submit();
  });

  endDate.addEventListener("change", function () {
    if (this.value) {
      startDate.setAttribute("max", this.value);
    } else {
      startDate.removeAttribute("max");
    }
    // Auto submit saat tanggal akhir dipilih
    document.getElementById("filterForm").submit();
  });
});

// Function untuk reset filter
function resetFilters() {
  const form = document.getElementById("filterForm");

  // Reset search
  form.elements["search"].value = "";

  // Reset jenis layanan
  form.elements["jenis_layanan"].selectedIndex = 0;

  // Reset tanggal
  form.elements["start_date"].value = "";
  form.elements["end_date"].value = "";

  form.submit();
}
