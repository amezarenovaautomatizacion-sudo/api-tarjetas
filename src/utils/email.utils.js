const nodemailer = require("nodemailer");
const axios = require("axios");
const { getBaseTemplate, buttonStyle, alertStyle, colors } = require("./emailBase.utils");
const { urls, company } = require("./email.config");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const getIpLocation = async (ip) => {
  try {
    if (!ip || ip === "No disponible" || ip.includes("::") || 
        ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      return null;
    }
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    if (response.data.status === "success") {
      return `${response.data.city}, ${response.data.regionName}, ${response.data.country}`;
    }
    return null;
  } catch {
    return null;
  }
};

const sendWelcomeEmail = async (email, nombre, tipo = "admin") => {
  const titles = {
    cliente: "🎉 ¡Bienvenido a TapCards!",
    admin: "👋 Bienvenido al Panel de Administración"
  };

  const messages = {
    cliente: "Ya puedes crear y administrar tus tarjetas digitales profesionales desde tu panel.",
    admin: "Ahora puedes gestionar toda la plataforma desde el panel administrativo."
  };

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;line-height:1.5;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong> 👋
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;line-height:1.7;margin-bottom:28px;">
      Tu cuenta en <strong style="color:${colors.primary};">TapCards</strong> ha sido creada exitosamente.
      ${messages[tipo]}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,184,211,0.06);border-radius:18px;padding:24px;margin-bottom:32px;border:1px solid rgba(13,184,211,0.15);">
      <tr>
        <td>
          <div style="font-size:13px;font-weight:700;color:${colors.primary};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">✅ ¿Qué puedes hacer ahora?</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;vertical-align:top;padding-right:10px;">
                <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.04);">
                  <div style="font-size:20px;margin-bottom:6px;">🃏</div>
                  <div style="font-size:13px;font-weight:600;color:${colors.text};margin-bottom:4px;">Crear tarjetas</div>
                  <div style="font-size:12px;color:${colors.textMuted};line-height:1.5;">Diseña tarjetas digitales profesionales con tus datos.</div>
                </div>
              </td>
              <td style="width:50%;vertical-align:top;padding-left:10px;">
                <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.04);">
                  <div style="font-size:20px;margin-bottom:6px;">📊</div>
                  <div style="font-size:13px;font-weight:600;color:${colors.text};margin-bottom:4px;">Ver estadísticas</div>
                  <div style="font-size:12px;color:${colors.textMuted};line-height:1.5;">Monitorea las visitas e interacciones de tus tarjetas.</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width:50%;vertical-align:top;padding-right:10px;">
                <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                  <div style="font-size:20px;margin-bottom:6px;">🔗</div>
                  <div style="font-size:13px;font-weight:600;color:${colors.text};margin-bottom:4px;">Compartir al instante</div>
                  <div style="font-size:12px;color:${colors.textMuted};line-height:1.5;">Comparte por QR, link o NFC con cualquier persona.</div>
                </div>
              </td>
              <td style="width:50%;vertical-align:top;padding-left:10px;">
                <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                  <div style="font-size:20px;margin-bottom:6px;">⚙️</div>
                  <div style="font-size:13px;font-weight:600;color:${colors.text};margin-bottom:4px;">Gestionar perfil</div>
                  <div style="font-size:12px;color:${colors.textMuted};line-height:1.5;">Actualiza tu información y configura tu cuenta.</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:28px 0;">
      <a href="${urls.frontend}/${tipo === "cliente" ? "cliente" : "admin"}/dashboard" 
         style="${buttonStyle(colors.primary)}">
        ✨ Acceder a mi cuenta
      </a>
    </div>

    <p style="font-size:12px;color:${colors.textMuted};text-align:center;margin-top:24px;">
      ¿Necesitas ayuda? Escríbenos por WhatsApp al <strong style="color:${colors.textSecondary};">${company.phone}</strong>
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🎉 ¡Bienvenido a TapCards, ${nombre}!`,
    html: getBaseTemplate(content, titles[tipo])
  };

  return await transporter.sendMail(mailOptions);
};

const sendLoginNotificationEmail = async (email, nombre, ip, tipo = "admin") => {
  const location = await getIpLocation(ip);
  const fechaHora = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "full",
    timeStyle: "short"
  });

  const locationText = location || "Ubicación no disponible";
  const ipText = ip || "No disponible";

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;line-height:1.6;">
      Detectamos un nuevo inicio de sesión en tu cuenta de TapCards. Si fuiste tú, puedes ignorar este mensaje.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.2);border-radius:18px;margin-bottom:28px;border:1px solid rgba(31,41,55,0.5);overflow:hidden;">
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid rgba(31,41,55,0.5);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:36px;vertical-align:top;padding-right:12px;">
                <div style="width:36px;height:36px;background:rgba(13,184,211,0.1);border-radius:10px;text-align:center;line-height:36px;font-size:16px;">📅</div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Fecha y hora</div>
                <div style="font-size:14px;color:${colors.text};">${fechaHora}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid rgba(31,41,55,0.5);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:36px;vertical-align:top;padding-right:12px;">
                <div style="width:36px;height:36px;background:rgba(13,184,211,0.1);border-radius:10px;text-align:center;line-height:36px;font-size:16px;">📍</div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Ubicación</div>
                <div style="font-size:14px;color:${colors.text};">${locationText}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:36px;vertical-align:top;padding-right:12px;">
                <div style="width:36px;height:36px;background:rgba(13,184,211,0.1);border-radius:10px;text-align:center;line-height:36px;font-size:16px;">🌐</div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Dirección IP</div>
                <div style="font-size:14px;color:${colors.text};font-family:monospace;">${ipText}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.08);border-radius:14px;padding:20px;margin-bottom:28px;border-left:3px solid ${colors.warning};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.6;">
          <strong style="color:${colors.warning};">⚠️ ¿No reconoces este acceso?</strong><br>
          Te recomendamos cambiar tu contraseña inmediatamente y contactar a soporte.
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <a href="${urls.frontend}/${tipo === "cliente" ? "cliente" : "admin"}/cambiar-contrasena" 
         style="${buttonStyle(colors.warning)}">
        🔒 Cambiar contraseña ahora
      </a>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔐 Nuevo inicio de sesión detectado en TapCards",
    html: getBaseTemplate(content, "🔐 Actividad reciente en tu cuenta")
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, nombre, resetToken, tipo = "admin") => {
  const resetUrl = tipo === "cliente"
    ? `${urls.frontend}/cliente/reset-password?token=${resetToken}`
    : `${urls.frontend}/reset-password?token=${resetToken}`;

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;line-height:1.6;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en TapCards.
      Haz clic en el botón para continuar.
    </p>

    <div style="text-align:center;margin:36px 0;">
      <a href="${resetUrl}" style="${buttonStyle(colors.primary)}">
        🔄 Restablecer contraseña
      </a>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,184,211,0.05);border-radius:16px;padding:20px;border:1px solid rgba(13,184,211,0.1);">
      <tr>
        <td>
          <div style="font-size:12px;font-weight:700;color:${colors.primary};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">⚠️ Importante</div>
          <div style="font-size:13px;color:${colors.textMuted};line-height:1.6;">
            Este enlace expirará en <strong style="color:${colors.textSecondary};">1 hora</strong>.<br><br>
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color:${colors.primary};word-break:break-all;font-size:11px;text-decoration:none;font-family:monospace;">${resetUrl}</a>
          </div>
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:${colors.textMuted};margin-top:24px;text-align:center;line-height:1.6;">
      Si no solicitaste este cambio, puedes ignorar este correo.<br>Tu contraseña permanecerá sin cambios.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔑 Restablece tu contraseña - TapCards",
    html: getBaseTemplate(content, "🔑 Restablecimiento de contraseña")
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail
};