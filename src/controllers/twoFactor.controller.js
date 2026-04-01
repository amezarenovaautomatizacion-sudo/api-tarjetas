const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateTwoFactorCode, generateBackupCodes, isCodeExpired, isValidCode } = require("../utils/twoFactor.utils");
const { sendTwoFactorCodeEmail, sendBackupCodesEmail } = require("../utils/email2fa.utils");

const getTableNames = (tipo) => {
  if (tipo === 'cliente') {
    return { usuarios: 'usuarios_clientes', twoFactor: 'two_factor_auth' };
  }
  return { usuarios: 'usuarios', twoFactor: 'two_factor_auth' };
};

exports.enableTwoFactor = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'admin';
    const tablas = getTableNames(tipo);
    
    const [users] = await db.execute(
      `SELECT email, nombre FROM ${tablas.usuarios} WHERE usuarioid = ? AND activo = 1`,
      [usuarioid]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const user = users[0];
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
    
    await db.execute(
      `UPDATE ${tablas.usuarios} SET two_factor_enabled = 1, two_factor_verified = 0 WHERE usuarioid = ?`,
      [usuarioid]
    );
    
    await db.execute(
      `DELETE FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ?`,
      [usuarioid, tipo]
    );
    
    for (let i = 0; i < hashedBackupCodes.length; i++) {
      await db.execute(
        `INSERT INTO ${tablas.twoFactor} (usuarioid, tipo_usuario, codigo, expiracion, usado) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 365 DAY), 0)`,
        [usuarioid, tipo, hashedBackupCodes[i]]
      );
    }
    
    try {
      await sendBackupCodesEmail(user.email, user.nombre, backupCodes);
    } catch (emailError) {
      console.error("Error enviando códigos de respaldo:", emailError);
    }
    
    return res.json({
      success: true,
      message: "2FA activado correctamente. En tu próximo inicio de sesión se te pedirá el código de verificación.",
      backup_codes: process.env.NODE_ENV === 'development' ? backupCodes : undefined
    });
    
  } catch (error) {
    console.error("Error en enableTwoFactor:", error);
    return res.status(500).json({ error: "Error al activar 2FA" });
  }
};

exports.disableTwoFactor = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'admin';
    const tablas = getTableNames(tipo);
    
    await db.execute(
      `UPDATE ${tablas.usuarios} SET two_factor_enabled = 0, two_factor_verified = 0 WHERE usuarioid = ?`,
      [usuarioid]
    );
    
    await db.execute(
      `DELETE FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ?`,
      [usuarioid, tipo]
    );
    
    return res.json({
      success: true,
      message: "2FA desactivado correctamente"
    });
    
  } catch (error) {
    console.error("Error en disableTwoFactor:", error);
    return res.status(500).json({ error: "Error al desactivar 2FA" });
  }
};

exports.sendTwoFactorCode = async (req, res) => {
  try {
    const { email, tipo = 'cliente' } = req.body;
    const tablas = getTableNames(tipo);
    
    const [users] = await db.execute(
      `SELECT usuarioid, nombre, email, two_factor_enabled FROM ${tablas.usuarios} WHERE email = ? AND activo = 1`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const user = users[0];
    
    if (user.two_factor_enabled !== 1) {
      return res.status(400).json({ error: "2FA no está activado para este usuario" });
    }
    
    await db.execute(
      `DELETE FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ? AND usado = 0 AND LENGTH(codigo) = 6`,
      [user.usuarioid, tipo]
    );
    
    const codigo = generateTwoFactorCode();
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 10);
    
    await db.execute(
      `INSERT INTO ${tablas.twoFactor} (usuarioid, tipo_usuario, codigo, expiracion, usado) VALUES (?, ?, ?, ?, 0)`,
      [user.usuarioid, tipo, codigo, expiracion]
    );
    
    try {
      await sendTwoFactorCodeEmail(user.email, user.nombre, codigo);
    } catch (emailError) {
      console.error("Error enviando código 2FA:", emailError);
      return res.status(500).json({ error: "Error al enviar el código de verificación" });
    }
    
    return res.json({
      success: true,
      message: "Código de verificación enviado a tu correo electrónico",
      expira_en: 10
    });
    
  } catch (error) {
    console.error("Error en sendTwoFactorCode:", error);
    return res.status(500).json({ error: "Error al enviar código 2FA" });
  }
};

exports.verifyTwoFactorCode = async (req, res) => {
  try {
    const { email, codigo, tipo = 'cliente', backup_code = false } = req.body;
    const tablas = getTableNames(tipo);
    
    if (!email || !codigo) {
      return res.status(400).json({ error: "Email y código son requeridos" });
    }
    
    const [users] = await db.execute(
      `SELECT usuarioid, nombre, email, two_factor_enabled FROM ${tablas.usuarios} WHERE email = ? AND activo = 1`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const user = users[0];
    let isValid = false;
    
    if (backup_code) {
      const [codes] = await db.execute(
        `SELECT id, codigo, usado FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ? AND usado = 0 AND LENGTH(codigo) > 6`,
        [user.usuarioid, tipo]
      );
      
      for (const code of codes) {
        const match = await bcrypt.compare(codigo, code.codigo);
        if (match) {
          isValid = true;
          await db.execute(`UPDATE ${tablas.twoFactor} SET usado = 1 WHERE id = ?`, [code.id]);
          break;
        }
      }
      
      if (!isValid) {
        return res.status(401).json({ error: "Código de respaldo inválido o ya utilizado" });
      }
    } else {
      if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({ error: "Código inválido. Debe ser de 6 dígitos." });
      }
      
      const [codes] = await db.execute(
        `SELECT id, codigo, expiracion, usado, intentos FROM ${tablas.twoFactor} 
         WHERE usuarioid = ? AND tipo_usuario = ? AND usado = 0 AND codigo = ? 
         ORDER BY id DESC LIMIT 1`,
        [user.usuarioid, tipo, codigo]
      );
      
      if (codes.length === 0) {
        return res.status(401).json({ error: "Código inválido" });
      }
      
      const record = codes[0];
      
      if (new Date() > new Date(record.expiracion)) {
        await db.execute(`UPDATE ${tablas.twoFactor} SET usado = 1 WHERE id = ?`, [record.id]);
        return res.status(401).json({ error: "El código ha expirado. Solicita uno nuevo." });
      }
      
      if (record.intentos >= 5) {
        await db.execute(`UPDATE ${tablas.twoFactor} SET usado = 1 WHERE id = ?`, [record.id]);
        return res.status(401).json({ error: "Demasiados intentos. Solicita un nuevo código." });
      }
      
      await db.execute(`UPDATE ${tablas.twoFactor} SET intentos = intentos + 1 WHERE id = ?`, [record.id]);
      isValid = true;
    }
    
    if (isValid) {
      // Marcar como verificado en la base de datos
      await db.execute(
        `UPDATE ${tablas.usuarios} SET two_factor_verified = 1 WHERE usuarioid = ?`,
        [user.usuarioid]
      );
      
      await db.execute(
        `UPDATE ${tablas.twoFactor} SET usado = 1 WHERE usuarioid = ? AND tipo_usuario = ? AND LENGTH(codigo) = 6 AND usado = 0`,
        [user.usuarioid, tipo]
      );
      
      return res.json({
        success: true,
        message: "Código verificado correctamente",
        two_factor_verified: true
      });
    }
    
  } catch (error) {
    console.error("Error en verifyTwoFactorCode:", error);
    return res.status(500).json({ error: "Error al verificar código 2FA" });
  }
};

exports.getTwoFactorStatus = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'admin';
    const tablas = getTableNames(tipo);
    
    const [users] = await db.execute(
      `SELECT two_factor_enabled, two_factor_verified FROM ${tablas.usuarios} WHERE usuarioid = ?`,
      [usuarioid]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const [backupCount] = await db.execute(
      `SELECT COUNT(*) as count FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ? AND usado = 0 AND LENGTH(codigo) > 6`,
      [usuarioid, tipo]
    );
    
    return res.json({
      two_factor_enabled: users[0].two_factor_enabled === 1,
      two_factor_verified: users[0].two_factor_verified === 1,
      backup_codes_remaining: backupCount[0].count
    });
    
  } catch (error) {
    console.error("Error en getTwoFactorStatus:", error);
    return res.status(500).json({ error: "Error al obtener estado de 2FA" });
  }
};

exports.regenerateBackupCodes = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'admin';
    const tablas = getTableNames(tipo);
    
    const [users] = await db.execute(
      `SELECT email, nombre FROM ${tablas.usuarios} WHERE usuarioid = ? AND activo = 1`,
      [usuarioid]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    const user = users[0];
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
    
    await db.execute(
      `DELETE FROM ${tablas.twoFactor} WHERE usuarioid = ? AND tipo_usuario = ? AND LENGTH(codigo) > 6`,
      [usuarioid, tipo]
    );
    
    for (let i = 0; i < hashedBackupCodes.length; i++) {
      await db.execute(
        `INSERT INTO ${tablas.twoFactor} (usuarioid, tipo_usuario, codigo, expiracion, usado) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 365 DAY), 0)`,
        [usuarioid, tipo, hashedBackupCodes[i]]
      );
    }
    
    try {
      await sendBackupCodesEmail(user.email, user.nombre, backupCodes);
    } catch (emailError) {
      console.error("Error enviando códigos de respaldo:", emailError);
    }
    
    return res.json({
      success: true,
      message: "Nuevos códigos de respaldo generados y enviados a tu correo"
    });
    
  } catch (error) {
    console.error("Error en regenerateBackupCodes:", error);
    return res.status(500).json({ error: "Error al regenerar códigos de respaldo" });
  }
};