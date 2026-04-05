const multer = require("multer");
const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message,
    });
  }

  if (err.message === "Only image uploads are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key — that value already exists",
    });
  }

  const statusCode = err.statusCode && err.isOperational ? err.statusCode : 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Something went wrong";

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

module.exports = { errorHandler, notFoundHandler };
