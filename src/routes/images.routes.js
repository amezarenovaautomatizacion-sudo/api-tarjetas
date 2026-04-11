const express = require("express");
const router = express.Router();
const { getImage } = require("../controllers/images.controller");

router.get("/:filename", getImage);

module.exports = router;
