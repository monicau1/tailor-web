const multer = require("multer");
const path = require("path");
const { UPLOAD_PATHS } = require("../../shared/config");

// Storage untuk pembayaran
const storagePembayaran = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATHS.PELANGGAN.PEMBAYARAN);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "pembayaran-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage untuk foto pesanan permak
const storagePermak = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATHS.PELANGGAN.PERMAK); // Gunakan path PERMAK, bukan PESANAN
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "permak-" + uniqueSuffix + path.extname(file.originalname));
  },
});
// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Hanya file gambar yang diperbolehkan (jpg, jpeg, png)"
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error, false);
  }
  cb(null, true);
};

// Upload instances
const uploadPembayaran = multer({
  storage: storagePembayaran,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
}).single("bukti_pembayaran");

const uploadPermak = multer({
  storage: storagePermak,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
}).single("gambar_permak");

// Handler functions
const handleUploadPembayaran = (req, res, next) => {
  uploadPembayaran(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File terlalu besar. Maksimal 5MB");
      } else {
        req.flash("error", err.message);
      }
      return res.redirect("back");
    }
    next();
  });
};

const handleUploadPermak = (req, res, next) => {
  uploadPermak(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "File terlalu besar. Maksimal 5MB");
      } else {
        req.flash("error", err.message);
      }
      return res.redirect("back");
    }
    next();
  });
};

module.exports = {
  handleUploadPembayaran,
  handleUploadPermak,
};
