const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Acceso denegado. Token no proporcionado."
      });
    }

    // Verificar si el token está en blacklist (para logout)
    const [blacklisted] = await db.execute(
      "SELECT token FROM tokens_blacklist WHERE token = ?",
      [token]
    );

    if (blacklisted.length > 0) {
      return res.status(401).json({
        error: "Token inválido. Sesión cerrada."
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          error: "Token inválido o expirado."
        });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error en autenticación"
    });
  }
};

const authorizeRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autenticado"
      });
    }

    if (!rolesPermitidos.includes(req.user.rolid)) {
      return res.status(403).json({
        error: "No tienes permisos para acceder a este recurso"
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};