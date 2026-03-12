const express = require("express");
const router = express.Router();
const tarjetaClienteController = require("../controllers/tarjetaCliente.controller");
const { authenticateToken, authorizeCliente } = require("../middleware/auth.middleware");

// Todas las rutas de cliente requieren autenticación y rol de cliente
router.post("/cliente/tarjetas", authenticateToken, authorizeCliente, tarjetaClienteController.createTarjeta);
router.get("/cliente/tarjetas", authenticateToken, authorizeCliente, tarjetaClienteController.getMisTarjetas);
router.get("/cliente/tarjetas/:id", authenticateToken, authorizeCliente, tarjetaClienteController.getTarjeta);
router.put("/cliente/tarjetas/:id", authenticateToken, authorizeCliente, tarjetaClienteController.updateTarjeta);
router.delete("/cliente/tarjetas/:id", authenticateToken, authorizeCliente, tarjetaClienteController.deleteTarjeta);

// Ruta publica para tarjetas compartidas
router.get("/tarjetas/publicas/:slug", tarjetaClienteController.getTarjetaPublica);

module.exports = router;