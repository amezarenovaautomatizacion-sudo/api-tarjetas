const express = require("express");
const router = express.Router();
const twoFactorController = require("../controllers/twoFactor.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/2fa/send-code", twoFactorController.sendTwoFactorCode);
router.post("/2fa/verify", twoFactorController.verifyTwoFactorCode);
router.post("/2fa/enable", authenticateToken, twoFactorController.enableTwoFactor);
router.post("/2fa/disable", authenticateToken, twoFactorController.disableTwoFactor);
router.get("/2fa/status", authenticateToken, twoFactorController.getTwoFactorStatus);
router.post("/2fa/regenerate-backup-codes", authenticateToken, twoFactorController.regenerateBackupCodes);

module.exports = router;