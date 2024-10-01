const { Router } = require("express");
const usersController = require("../controllers/users-controller");
const FileUpload = require("../middleware/file-upload");
const { check } = require("express-validator");

const router = Router();

router.get("/", usersController.getAllUsers);
router.post("/login", usersController.login);

router.post(
  "/signup",
  FileUpload.single("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersController.signup
);

module.exports = router;
