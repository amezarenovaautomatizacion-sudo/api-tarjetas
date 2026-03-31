const db = require("../config/db");

const getTableNames = (tipo) => {
  if (tipo === 'cliente') {
    return { usuarios: 'usuarios_clientes' };
  }
  return { usuarios: 'usuarios' };
};

const requireTwoFactor = async (req, res, next) => {
  try {
    const usuarioid = req.user?.usuarioid;
    const tipo = req.user?.tipo || 'admin';
    
    if (!usuarioid) {
      return next();
    }
    
    const tablas = getTableNames(tipo);
    
    const [users] = await db.execute(
      `SELECT two_factor_enabled, two_factor_verified FROM ${tablas.usuarios} WHERE usuarioid = ?`,
      [usuarioid]
    );
    
    if (users.length > 0 && users[0].two_factor_enabled === 1 && users[0].two_factor_verified !== 1) {
      return res.status(403).json({
        error: "Se requiere verificación de dos factores",
        requires_two_factor: true,
        message: "Completa la verificación de dos factores para continuar"
      });
    }
    
    next();
    
  } catch (error) {
    console.error("Error en requireTwoFactor:", error);
    next();
  }
};

module.exports = { requireTwoFactor };