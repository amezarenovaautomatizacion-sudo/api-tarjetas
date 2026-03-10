const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/email.utils");
const { getMexicoISO } = require("../utils/date.utils");

exports.login = async (req, res) => {
  try {
    const { email, password, ip_ultimo_login } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y password son requeridos"
      });
    }

    const [rows] = await db.execute(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Usuario o contraseña incorrectos"
      });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Usuario o contraseña incorrectos"
      });
    }

    const ultimo_login = getMexicoISO();

    await db.execute(
      `UPDATE usuarios 
       SET ultimo_login = ?, ip_ultimo_login = ?
       WHERE usuarioid = ?`,
      [ultimo_login, ip_ultimo_login, user.usuarioid]
    );

    const token = jwt.sign(
      {
        usuarioid: user.usuarioid,
        email: user.email,
        rolid: user.rolid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    delete user.password;

    return res.json({
      token,
      usuario: {
        ...user,
        ultimo_login,
        ip_ultimo_login
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error en login"
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre, email, password, ip_registro } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Nombre, email y password son requeridos"
      });
    }

    // Verificar si el email ya existe
    const [existingUser] = await db.execute(
      "SELECT usuarioid FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "El email ya está registrado"
      });
    }

    // Validar password (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    // Encriptar password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const fecha_creacion = getMexicoISO();

    // Insertar nuevo usuario (rolid 3 = visitante por defecto)
    const [result] = await db.execute(
      `INSERT INTO usuarios 
       (nombre, email, password, rolid, activo, creado, ip_ultimo_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, email, hashedPassword, 3, 1, fecha_creacion, ip_registro || null]
    );

    const token = jwt.sign(
      {
        usuarioid: result.insertId,
        email: email,
        rolid: 3
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        usuarioid: result.insertId,
        nombre,
        email,
        rolid: 3,
        activo: 1,
        creado: fecha_creacion
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error en el registro de usuario"
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        error: "Token no proporcionado"
      });
    }

    // Decodificar el token para obtener fecha de expiración
    const decoded = jwt.decode(token);
    
    if (decoded && decoded.exp) {
      const fecha_expiracion = new Date(decoded.exp * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Guardar token en blacklist
      await db.execute(
        "INSERT INTO tokens_blacklist (token, fecha_expiracion) VALUES (?, ?)",
        [token, fecha_expiracion]
      );
    }

    return res.json({
      message: "Sesión cerrada exitosamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al cerrar sesión"
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;

    const [rows] = await db.execute(
      `SELECT u.usuarioid, u.nombre, u.email, u.activo, u.creado, 
              u.ultimo_login, u.ip_ultimo_login, u.rolid,
              r.nombre as rol_nombre
       FROM usuarios u
       LEFT JOIN roles r ON u.rolid = r.rolid
       WHERE u.usuarioid = ? AND u.activo = 1`,
      [usuarioid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const user = rows[0];

    return res.json({
      usuario: user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener perfil"
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password_actual, password_nuevo } = req.body;
    const usuarioid = req.user.usuarioid;

    if (!password_actual || !password_nuevo) {
      return res.status(400).json({
        error: "Contraseña actual y nueva son requeridas"
      });
    }

    if (password_nuevo.length < 6) {
      return res.status(400).json({
        error: "La nueva contraseña debe tener al menos 6 caracteres"
      });
    }

    // Obtener usuario actual
    const [rows] = await db.execute(
      "SELECT password FROM usuarios WHERE usuarioid = ? AND activo = 1",
      [usuarioid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const user = rows[0];

    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(password_actual, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Contraseña actual incorrecta"
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password_nuevo, saltRounds);

    // Actualizar contraseña
    await db.execute(
      "UPDATE usuarios SET password = ? WHERE usuarioid = ?",
      [hashedPassword, usuarioid]
    );

    return res.json({
      message: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al cambiar contraseña"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email es requerido"
      });
    }

    // Buscar usuario
    const [users] = await db.execute(
      "SELECT usuarioid, nombre, email FROM usuarios WHERE email = ? AND activo = 1",
      [email]
    );

    if (users.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña"
      });
    }

    const user = users[0];

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Calcular expiración (1 hora)
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);
    const expiracionStr = expiracion.toISOString().slice(0, 19).replace("T", " ");

    // Guardar token en BD
    await db.execute(
      `INSERT INTO password_reset_tokens (usuarioid, token, expiracion) 
       VALUES (?, ?, ?)`,
      [user.usuarioid, resetToken, expiracionStr]
    );

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, user.nombre, resetToken);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar la petición si el email no se envía
    }

    return res.json({
      message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error en recuperación de contraseña"
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        error: "Token y nueva contraseña son requeridos"
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres"
      });
    }

    // Buscar token válido
    const [tokens] = await db.execute(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND usado = 0 AND expiracion > NOW() 
       LIMIT 1`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        error: "Token inválido o expirado"
      });
    }

    const resetToken = tokens[0];

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Actualizar contraseña
    await db.execute(
      "UPDATE usuarios SET password = ? WHERE usuarioid = ?",
      [hashedPassword, resetToken.usuarioid]
    );

    // Marcar token como usado
    await db.execute(
      "UPDATE password_reset_tokens SET usado = 1 WHERE id = ?",
      [resetToken.id]
    );

    // Invalidar todos los tokens anteriores del usuario (opcional)
    await db.execute(
      "UPDATE password_reset_tokens SET usado = 1 WHERE usuarioid = ? AND id != ?",
      [resetToken.usuarioid, resetToken.id]
    );

    return res.json({
      message: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al restablecer contraseña"
    });
  }
};