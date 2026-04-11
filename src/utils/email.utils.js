const nodemailer = require("nodemailer");
const axios = require("axios");
const { getBaseTemplate, buttonStyle, colors } = require("./emailBase.utils");
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
    <p style="color:${colors.text};font-size:16px;margin-bottom:20px;line-height:1.5;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;line-height:1.6;margin-bottom:25px;">
      Tu cuenta en <strong style="color:${colors.primary};">TapCards</strong> ha sido creada exitosamente. 
      ${messages[tipo]}
    </p>
    
    <table width="100%" style="background:rgba(13,184,211,0.08);border-radius:16px;padding:24px;margin-bottom:32px;border:1px solid rgba(13,184,211,0.15);">
      <tr>
        <td style="vertical-align:top;">
          <div style="font-size:14px;color:${colors.textSecondary};line-height:1.6;">
            <strong style="color:${colors.primaryLight};">✅ ¿Qué puedes hacer ahora?</strong><br>
            • Crear tarjetas digitales profesionales<br>
            • Gestionar tu perfil y configuraciones<br>
            • Ver estadísticas de tus tarjetas<br>
            • Compartir tus tarjetas con clientes
          </div>
        </td>
      </tr>
    </table>
    
    <div style="text-align:center;margin:20px 0;">
      <a href="${urls.frontend}/${tipo === "cliente" ? "cliente" : "admin"}/dashboard" 
         style="${buttonStyle(colors.primary)}">
        ✨ Acceder a mi cuenta
      </a>
    </div>
    
    <p style="font-size:13px;color:${colors.textMuted};text-align:center;margin-top:24px;">
      ¿Necesitas ayuda? Contáctanos por WhatsApp al <strong>${company.phone}</strong>
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
    <p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;">
      Detectamos un nuevo inicio de sesión en tu cuenta de TapCards.
    </p>
    
    <table width="100%" cellpadding="14" style="background:rgba(0,0,0,0.2);border-radius:16px;margin-bottom:28px;border:1px solid ${colors.border};">
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">📅 Fecha y hora</strong><br>
          <span style="color:${colors.textSecondary};">${fechaHora}</span>
        </td>
      </tr>
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">📍 Ubicación</strong><br>
          <span style="color:${colors.textSecondary};">${locationText}</span>
        </td>
      </tr>
      <tr>
        <td>
          <strong style="color:${colors.primaryLight};">🌐 Dirección IP</strong><br>
          <span style="color:${colors.textSecondary};">${ipText}</span>
        </td>
      </tr>
    </table>
    
    <table width="100%" style="background:rgba(245,158,11,0.1);border-radius:14px;padding:20px;margin-bottom:28px;border-left:3px solid ${colors.warning};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.5;">
          ⚠️ <strong>¿No reconoces este acceso?</strong><br>
          Te recomendamos cambiar tu contraseña inmediatamente y contactar a soporte.
        </td>
      </tr>
    </table>
    
    <div style="text-align:center;">
      <a href="${urls.frontend}/${tipo === "cliente" ? "cliente" : "admin"}/cambiar-contrasena" 
         style="${buttonStyle(colors.warning)}">
        🔒 Cambiar contraseña
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
    <p style="color:${colors.text};font-size:16px;margin-bottom:18px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:25px;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en TapCards.
    </p>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="${buttonStyle(colors.primary)}">
        🔄 Restablecer contraseña
      </a>
    </div>
    
    <table width="100%" style="background:rgba(13,184,211,0.05);border-radius:14px;padding:20px;border:1px solid rgba(13,184,211,0.1);">
      <tr>
        <td style="font-size:13px;color:${colors.textMuted};line-height:1.5;">
          <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>.<br><br>
          Si el botón no funciona, copia este enlace en tu navegador:<br>
          <a href="${resetUrl}" style="color:${colors.primary};word-break:break-all;font-size:12px;">
            ${resetUrl}
          </a>
        </td>
      </tr>
    </table>
    
    <p style="font-size:12px;color:${colors.textMuted};margin-top:28px;text-align:center;">
      Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá igual.
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