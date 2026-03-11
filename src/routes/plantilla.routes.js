const express = require("express");
const router = express.Router();
const plantillaController = require("../controllers/plantilla.controller");
const { authenticateToken, authorizeRole } = require("../middleware/auth.middleware");

// Rutas públicas
router.get("/variables", plantillaController.getVariables);
router.get("/plantillas", plantillaController.getPlantillas);
router.get("/plantillas/:id", plantillaController.getPlantillaById);

// Rutas protegidas (solo admin y editor)
router.post("/plantillas", authenticateToken, authorizeRole([1, 2]), plantillaController.createPlantilla);
router.put("/plantillas/:id", authenticateToken, authorizeRole([1, 2]), plantillaController.updatePlantilla);
router.delete("/plantillas/:id", authenticateToken, authorizeRole([1]), plantillaController.deletePlantilla);
router.post("/plantillas/:id/preview", plantillaController.previewPlantilla);

module.exports = router;