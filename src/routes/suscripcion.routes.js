const express = require("express");
const router = express.Router();
const suscripcionController = require("../controllers/suscripcion.controller");
const { authenticateToken, authorizeRole, authorizeCliente } = require("../middleware/auth.middleware");
const { requireTwoFactor } = require("../middleware/twoFactor.middleware");

// Rutas públicas (para obtener planes)
router.get("/suscripciones/tipos", suscripcionController.getTiposSuscripcion);

// Rutas protegidas para clientes
router.get("/cliente/suscripcion/mi-suscripcion", authenticateToken, authorizeCliente, requireTwoFactor, suscripcionController.getMiSuscripcion);
router.get("/cliente/suscripcion/historial", authenticateToken, authorizeCliente, requireTwoFactor, suscripcionController.getHistorialSuscripciones);
router.post("/cliente/suscripcion/crear", authenticateToken, authorizeCliente, requireTwoFactor, suscripcionController.crearSuscripcion);
router.post("/cliente/suscripcion/cancelar", authenticateToken, authorizeCliente, requireTwoFactor, suscripcionController.cancelarSuscripcion);
router.get("/cliente/dashboard", authenticateToken, authorizeCliente, requireTwoFactor, suscripcionController.getDashboardStats);

// Rutas protegidas para admin
router.get("/admin/suscripciones", authenticateToken, authorizeRole([1]), suscripcionController.getAllSuscripciones);
router.post("/admin/suscripciones/:suscripcionid/renovar", authenticateToken, authorizeRole([1]), suscripcionController.renovarSuscripcionAdmin);

module.exports = router;