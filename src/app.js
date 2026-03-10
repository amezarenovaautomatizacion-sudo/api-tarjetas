const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

app.use("/api", authRoutes);

module.exports = app;