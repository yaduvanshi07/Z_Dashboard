const express = require("express");
const authRoutes = require("./auth.routes");
const recordRoutes = require("./record.routes");
const dashboardRoutes = require("./dashboard.routes");
const uploadRoutes = require("./upload.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/records", recordRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
