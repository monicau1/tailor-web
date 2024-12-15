// middleware/permakUploadMiddleware.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Definisikan path dasar untuk upload
// __dirname adalah directory dari file ini
// '../../shared/uploads' naik dua level dan masuk ke folder shared/uploads
const SHARED_UPLOADS_PATH = path.join(__dirname, "../../shared/uploads");

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  // Fungsi destination menentukan folder tujuan file
  destination: function (req, file, cb) {
    let uploadPath;

    // Tentukan path berdasarkan jenis field
    if (file.fieldname === "bukti_pembayaran") {
      // Jika file adalah bukti pembayaran
      uploadPath = path.join(SHARED_UPLOADS_PATH, "pelanggan/pembayaran");
    } else if (file.fieldname.startsWith("foto_pakaian")) {
      // Jika file adalah foto pakaian yang akan dipermak
      uploadPath = path.join(SHARED_UPLOADS_PATH, "pelanggan/permak");
    }

    // Buat direktori jika belum ada
    // { recursive: true } memungkinkan pembuatan nested directories
    fs.mkdirSync(uploadPath, { recursive: true });

    // Callback dengan null (tidak ada error) dan path yang ditentukan
    cb(null, uploadPath);
  },

  // Fungsi filename menentukan nama file yang disimpan
  filename: function (req, file, cb) {
    // Generate unique filename untuk menghindari konflik nama file
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Dapatkan ekstensi file asli
    const ext = path.extname(file.originalname);

    // Tentukan prefix berdasarkan jenis file
    let prefix = file.fieldname.startsWith("foto_pakaian")
      ? "permak"
      : "payment";

    // Callback dengan null (tidak ada error) dan nama file yang dibuat
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

// Filter untuk memvalidasi tipe file yang diupload
const fileFilter = (req, file, cb) => {
  // Daftar tipe file yang diizinkan
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    // File valid, terima file
    cb(null, true);
  } else {
    // File invalid, tolak dengan pesan error
    cb(
      new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP"),
      false
    );
  }
};

// Buat instance multer dengan konfigurasi
const upload = multer({
  storage: storage, // Gunakan storage configuration yang sudah dibuat
  fileFilter: fileFilter, // Gunakan file filter yang sudah dibuat
  limits: {
    fileSize: 5 * 1024 * 1024, // Batasi ukuran file (5MB)
    files: 10, // Batasi jumlah file dalam satu request
  },
});

// Export middleware untuk digunakan di routes
module.exports = upload;

/* 
Cara Penggunaan di Routes:

1. Single file upload:
   upload.single('fieldName')
   
   Contoh:
   router.post('/upload', upload.single('bukti_pembayaran'), controller);

2. Multiple fields upload:
   upload.fields([
     { name: 'foto_pakaian[]', maxCount: 10 },
     { name: 'bukti_pembayaran', maxCount: 1 }
   ])
   
   Contoh:
   router.post('/upload', upload.fields([
     { name: 'foto_pakaian[]', maxCount: 10 },
     { name: 'bukti_pembayaran', maxCount: 1 }
   ]), controller);

3. Error Handling:
   try {
     // Upload logic
   } catch (error) {
     if (error instanceof multer.MulterError) {
       // A Multer error occurred when uploading
       if (error.code === 'LIMIT_FILE_SIZE') {
         return res.status(400).json({
           error: 'File terlalu besar'
         });
       }
     }
   }
*/
