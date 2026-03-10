const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function getMexicoISO() {
  const date = new Date();

  const mexico = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );

  return mexico.toISOString().replace("Z", "");
}

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