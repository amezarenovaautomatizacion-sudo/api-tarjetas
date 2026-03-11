const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken, authorizeCliente } = require("../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/cliente/login", (req, res) => {
  req.body.tipo = 'cliente';
  authController.login(req, res);
});
router.post("/cliente/register", authController.registerCliente);
router.post("/cliente/forgot-password", (req, res) => {
  req.body.tipo = 'cliente';
  authController.forgotPassword(req, res);
});
router.post("/cliente/reset-password", (req, res) => {
  req.body.tipo = 'cliente';
  authController.resetPassword(req, res);
});

router.post("/logout", authenticateToken, authController.logout);
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/change-password", authenticateToken, authController.changePassword);

router.post("/cliente/logout", authenticateToken, authController.logout);
router.get("/cliente/profile", authenticateToken, authController.getProfile);
router.put("/cliente/change-password", authenticateToken, authController.changePassword);
router.put("/cliente/update-profile", authenticateToken, authorizeCliente, authController.updateClienteProfile);

module.exports = router;