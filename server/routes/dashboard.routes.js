const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

router.get("/summary", authenticateJWT, dashboardController.summary);

module.exports = router;
