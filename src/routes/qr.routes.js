const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qr.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/qr/generate", authenticateToken, qrController.generateCustomQR);

module.exports = router;