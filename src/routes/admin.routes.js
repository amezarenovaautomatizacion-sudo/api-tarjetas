const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateToken, authorizeRole } = require("../middleware/auth.middleware");

router.get("/admin/usuarios", authenticateToken, authorizeRole([1]), adminController.getUsuarios);
router.get("/admin/usuarios/:id", authenticateToken, authorizeRole([1]), adminController.getUsuarioById);
router.put("/admin/usuarios/:id/rol", authenticateToken, authorizeRole([1]), adminController.updateUsuarioRol);
router.put("/admin/usuarios/:id/estado", authenticateToken, authorizeRole([1]), adminController.updateUsuarioEstado);
router.delete("/admin/usuarios/:id", authenticateToken, authorizeRole([1]), adminController.deleteUsuario);

router.get("/admin/dashboard/stats", authenticateToken, authorizeRole([1]), adminController.getGlobalStats);
router.get("/admin/estadisticas/visitas", authenticateToken, authorizeRole([1]), adminController.getEstadisticasVisitas);
router.get("/admin/estadisticas/tarjetas", authenticateToken, authorizeRole([1]), adminController.getEstadisticasTarjetas);

router.get("/admin/variables", authenticateToken, authorizeRole([1]), adminController.getVariablesAdmin);
router.post("/admin/variables", authenticateToken, authorizeRole([1]), adminController.createVariable);
router.put("/admin/variables/:id", authenticateToken, authorizeRole([1]), adminController.updateVariable);
router.delete("/admin/variables/:id", authenticateToken, authorizeRole([1]), adminController.deleteVariable);

router.get("/admin/categorias", authenticateToken, authorizeRole([1]), adminController.getCategorias);
router.post("/admin/categorias", authenticateToken, authorizeRole([1]), adminController.createCategoria);
router.put("/admin/categorias/:id", authenticateToken, authorizeRole([1]), adminController.updateCategoria);
router.delete("/admin/categorias/:id", authenticateToken, authorizeRole([1]), adminController.deleteCategoria);

router.get("/admin/logs", authenticateToken, authorizeRole([1]), adminController.getLogs);
router.get("/admin/logs/usuario/:id", authenticateToken, authorizeRole([1]), adminController.getLogsByUsuario);

module.exports = router;