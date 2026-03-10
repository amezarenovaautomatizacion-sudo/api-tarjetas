const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Rutas públicas
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Rutas protegidas
router.post("/logout", authenticateToken, authController.logout);
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/change-password", authenticateToken, authController.changePassword);

module.exports = router;