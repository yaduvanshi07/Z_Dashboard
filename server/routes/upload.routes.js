const express = require("express");
const uploadController = require("../controllers/upload.controller");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth");
const { uploadReceipt } = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/receipt",
  authenticateJWT,
  authorizeRoles("Analyst", "Admin"),
  uploadReceipt.single("file"),
  uploadController.receipt
);

module.exports = router;
