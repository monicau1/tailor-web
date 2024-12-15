// routes/admin/adminRoutes.js

const express = require("express");
const router = express.Router();
const pakaianController = require("../../controllers/admin/pakaianController");
const upload = require("../../middleware/admin/uploadImagePakaianMiddleware");

// Route untuk varian (tempatkan di awal)
router.put("/variant/:variantId/stock", pakaianController.updateVariantStock);
router.delete("/variant/:variantId", pakaianController.deleteVariant);

// Route untuk gambar
router.post(
  "/:id/images",
  upload.array("images", 5),
  pakaianController.uploadImages
);
router.delete("/:id/images/:imageId", pakaianController.deleteImage);
router.put("/:id/images/:imageId/primary", pakaianController.setPrimaryImage);

// Route untuk pakaian
router.get("/", pakaianController.getAllPakaian);
router.get("/create", pakaianController.showCreateForm);
router.post("/", pakaianController.createPakaian);
router.get("/:id", pakaianController.getPakaianById);
router.put("/:id", pakaianController.updatePakaian);
router.delete("/:id", pakaianController.deletePakaian);

module.exports = router;
