const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticateJWT, authenticateLocal } = require("../middlewares/auth");
const { validateBody } = require("../middlewares/validate");
const { validateRegister, validateLogin } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validateBody(validateRegister), authController.register);
router.post("/login", validateBody(validateLogin), authenticateLocal, authController.login);
router.get("/me", authenticateJWT, authController.me);

module.exports = router;
