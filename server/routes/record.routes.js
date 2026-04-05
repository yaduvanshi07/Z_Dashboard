const express = require("express");
const recordController = require("../controllers/record.controller");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth");
const { validateBody, validateQuery } = require("../middlewares/validate");
const {
  validateCreate,
  validateUpdate,
  validateListQuery,
} = require("../validators/record.validator");

const router = express.Router();

router.use(authenticateJWT);

router.get("/", validateQuery(validateListQuery), recordController.list);
router.get("/:id", recordController.getOne);
router.post(
  "/",
  authorizeRoles("Analyst", "Admin"),
  validateBody(validateCreate),
  recordController.create
);
router.patch(
  "/:id",
  authorizeRoles("Analyst", "Admin"),
  validateBody(validateUpdate),
  recordController.update
);
router.delete(
  "/:id",
  authorizeRoles("Analyst", "Admin"),
  recordController.remove
);

module.exports = router;
