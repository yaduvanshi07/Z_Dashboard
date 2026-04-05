const catchAsync = require("../utils/catchAsync");
const uploadService = require("../services/upload.service");

const receipt = catchAsync(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "File is required" });
  }
  const uploaded = await uploadService.uploadReceiptBuffer(
    req.file.buffer,
    req.file.mimetype
  );
  res.status(201).json({ success: true, data: uploaded });
});

module.exports = { receipt };
