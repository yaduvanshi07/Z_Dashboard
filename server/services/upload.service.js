const AppError = require("../utils/AppError");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

async function uploadReceiptBuffer(buffer, mimeType = "image/jpeg", folder = "finance-receipts") {
  if (!isCloudinaryConfigured()) {
    throw new AppError("File storage is not configured", 503);
  }

  const safeMime = /^image\/(jpeg|png|webp|gif)$/.test(mimeType) ? mimeType : "image/jpeg";
  const dataUri = `data:${safeMime};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

module.exports = { uploadReceiptBuffer };
