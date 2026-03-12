const nodemailer = require("nodemailer");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const colors = {
  primary: "#2690D8",
  secondary: "#4BCADF",
  accent: "#71E6D8",
  success: "#9AEDCE",
  light: "#E8FAF2",
  background: "#F4FBF6",
  dark: "#0C2F66",
  text: "#2D3748",
  muted: "#6B7280",
  border: "#E5E7EB"
};

const getBaseTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>

<body style="margin:0;padding:0;background:${colors.background};font-family:Inter,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 15px;">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

<tr>
<td style="background:linear-gradient(135deg,${colors.primary},${colors.secondary});padding:40px 30px;text-align:center;">
<div style="font-family:'Archivo Black',sans-serif;font-size:30px;color:white;letter-spacing:1px;">RENOVA</div>
<div style="color:rgba(255,255,255,0.9);margin-top:6px;font-size:14px;letter-spacing:1px;">Tarjetas de Presentación</div>
</td>
</tr>

${title ? `
<tr>
<td style="padding:35px 40px 0 40px;">
<div style="font-family:'Archivo Black',sans-serif;font-size:22px;color:${colors.dark};border-bottom:2px solid ${colors.accent};padding-bottom:10px;">
${title}
</div>
</td>
</tr>
` : ""}

<tr>
<td style="padding:35px 40px;">
${content}
</td>
</tr>

<tr>
<td style="background:#FAFAFA;border-top:1px solid ${colors.border};padding:28px 40px;text-align:center;font-size:13px;color:${colors.muted};">
<div style="font-family:'Archivo Black',sans-serif;color:${colors.dark};margin-bottom:8px;">RENOVA</div>
<div>© 2026 RENOVA</div>
<div style="margin-top:6px;font-size:12px;">Mensaje automático</div>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

const buttonStyle = (bg) => `
display:inline-block;
padding:14px 30px;
background:${bg};
color:white;
text-decoration:none;
border-radius:40px;
font-weight:600;
font-size:15px;
letter-spacing:.5px;
`;

const getIpLocation = async (ip) => {
  try {
    if (!ip || ip === "No disponible" || ip.includes("::") || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
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
    cliente: "Bienvenido al panel de cliente",
    admin: "Bienvenido al panel de administración"
  };

  const messages = {
    cliente: "Ya puedes administrar tus productos y facturación desde tu panel.",
    admin: "Ahora puedes gestionar la plataforma desde el panel administrativo."
  };

  const content = `
<p style="color:${colors.text};font-size:16px;margin-bottom:18px;">
Hola <strong>${nombre}</strong>
</p>

<p style="color:${colors.text};font-size:16px;line-height:1.6;margin-bottom:25px;">
Tu cuenta en <strong style="color:${colors.primary};">RENOVA</strong> ha sido creada correctamente.
</p>

<table width="100%" style="background:${colors.light};border-radius:10px;padding:20px;margin-bottom:30px;">
<tr>
<td>

<table>
<tr>

<td width="34" style="vertical-align:top;">
<svg width="24" height="24" viewBox="0 0 24 24" fill="${colors.primary}">
<path d="M12 2L2 7l10 5 10-5-10-5zm0 7l10 5-10 5-10-5 10-5z"/>
</svg>
</td>

<td style="font-size:15px;color:${colors.text};line-height:1.6;">
${messages[tipo]}
</td>

</tr>
</table>

</td>
</tr>
</table>

<div style="text-align:center;margin-top:30px;">
<a href="${process.env.FRONTEND_URL}/${tipo === "cliente" ? "cliente" : "admin"}/dashboard" style="${buttonStyle(colors.primary)}">
Acceder al panel
</a>
</div>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Bienvenido a RENOVA",
    html: getBaseTemplate(content, titles[tipo])
  };

  return await transporter.sendMail(mailOptions);
};

const sendLoginNotificationEmail = async (email, nombre, ip, tipo = "admin") => {

  const location = await getIpLocation(ip);

  const fechaHora = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "full",
    timeStyle: "long"
  });

  const locationText = location || "Ubicación no disponible";
  const ipText = ip || "No disponible";

  const content = `
<p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
Hola <strong>${nombre}</strong>
</p>

<p style="color:${colors.text};font-size:16px;margin-bottom:25px;">
Se detectó un nuevo inicio de sesión en tu cuenta de RENOVA.
</p>

<table width="100%" cellpadding="14" style="background:#F9FAFB;border-radius:12px;margin-bottom:30px;">

<tr>
<td style="border-bottom:1px solid ${colors.border};font-size:14px;color:${colors.text};">
<strong>Fecha y hora</strong><br>
${fechaHora}
</td>
</tr>

<tr>
<td style="border-bottom:1px solid ${colors.border};font-size:14px;color:${colors.text};">
<strong>Ubicación</strong><br>
${locationText}
</td>
</tr>

<tr>
<td style="font-size:14px;color:${colors.text};">
<strong>Dirección IP</strong><br>
${ipText}
</td>
</tr>

</table>

<div style="background:#FFF8E6;border-radius:10px;padding:20px;margin-bottom:28px;font-size:14px;color:${colors.text};line-height:1.6;">
Si no reconoces este acceso, cambia tu contraseña inmediatamente.
</div>

<div style="text-align:center;">
<a href="${process.env.FRONTEND_URL}/${tipo === "cliente" ? "cliente" : "admin"}/cambiar-contrasena" style="${buttonStyle(colors.dark)}">
Cambiar contraseña
</a>
</div>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Nuevo inicio de sesión detectado",
    html: getBaseTemplate(content, "Actividad reciente en tu cuenta")
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, nombre, resetToken, tipo = "admin") => {

  const resetUrl = tipo === "cliente"
    ? `${process.env.FRONTEND_URL}/cliente/reset-password?token=${resetToken}`
    : `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const content = `
<p style="color:${colors.text};font-size:16px;margin-bottom:18px;">
Hola <strong>${nombre}</strong>
</p>

<p style="color:${colors.text};font-size:16px;margin-bottom:25px;">
Recibimos una solicitud para restablecer la contraseña de tu cuenta.
</p>

<div style="text-align:center;margin:30px 0;">
<a href="${resetUrl}" style="${buttonStyle(colors.primary)}">
Restablecer contraseña
</a>
</div>

<table width="100%" style="background:#F3F7FF;border-radius:10px;padding:20px;margin-top:10px;">
<tr>
<td style="font-size:14px;color:${colors.text};line-height:1.6;">
Este enlace expirará en 1 hora.<br><br>
Si el botón no funciona puedes copiar este enlace en tu navegador:
<br><br>
<a href="${resetUrl}" style="color:${colors.primary};word-break:break-all;">
${resetUrl}
</a>
</td>
</tr>
</table>

<p style="font-size:13px;color:${colors.muted};margin-top:26px;">
Si no solicitaste este cambio puedes ignorar este correo.
</p>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Restablecer contraseña",
    html: getBaseTemplate(content, "Restablecimiento de contraseña")
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail
};