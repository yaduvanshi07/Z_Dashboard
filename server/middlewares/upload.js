const multer = require("multer");

const storage = multer.memoryStorage();

const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    if (!ok) {
      return cb(new Error("Only image uploads are allowed"));
    }
    return cb(null, true);
  },
});

module.exports = { uploadReceipt };
