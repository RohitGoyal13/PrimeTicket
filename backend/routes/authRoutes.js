const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/changePassword", authMiddleware, changePassword);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
