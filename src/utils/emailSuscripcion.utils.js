const nodemailer = require("nodemailer");

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
<div>© 2026 RENOVA - Tarjetas de Presentación Digitales</div>
<div style="margin-top:6px;font-size:12px;">Mensaje automático - No responder a este correo</div>
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

const sendVencimientoEmail = async (email, nombre, diasRestantes, fechaFin, planNombre) => {
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let mensajeAdvertencia = "";
  let colorAdvertencia = colors.primary;
  
  if (diasRestantes <= 0) {
    mensajeAdvertencia = "Tu suscripción ya ha expirado. Renueva ahora para seguir disfrutando de todos los beneficios.";
    colorAdvertencia = "#dc2626";
  } else if (diasRestantes <= 3) {
    mensajeAdvertencia = `⚠️ ¡ATENCIÓN! Tu suscripción vencerá en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. ¡No esperes más!`;
    colorAdvertencia = "#f59e0b";
  } else {
    mensajeAdvertencia = `Tu suscripción vencerá en ${diasRestantes} días.`;
  }

  const content = `
<p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
Hola <strong>${nombre}</strong>,
</p>

<p style="color:${colors.text};font-size:16px;margin-bottom:25px;">
Te recordamos que tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong> está por vencer.
</p>

<table width="100%" cellpadding="14" style="background:#F9FAFB;border-radius:12px;margin-bottom:30px;">
<tr>
<td style="border-bottom:1px solid ${colors.border};font-size:14px;color:${colors.text};">
<strong>📅 Fecha de vencimiento</strong><br>
${fechaFinFormateada}
</td>
</tr>
<tr>
<td style="border-bottom:1px solid ${colors.border};font-size:14px;color:${colors.text};">
<strong>⏰ Días restantes</strong><br>
<span style="color:${colorAdvertencia};font-weight:bold;">${diasRestantes <= 0 ? 'VENCIDA' : `${diasRestantes} días`}</span>
</td>
</tr>
<tr>
<td style="font-size:14px;color:${colors.text};">
<strong>📋 Plan actual</strong><br>
${planNombre}
</td>
</tr>
</table>

<div style="background:#FFF8E6;border-radius:10px;padding:20px;margin-bottom:28px;font-size:14px;color:${colors.text};line-height:1.6;">
<p style="margin:0 0 10px 0;"><strong>${mensajeAdvertencia}</strong></p>
<p style="margin:0;">Renueva tu suscripción para no perder acceso a tus tarjetas digitales y seguir disfrutando de todos los beneficios.</p>
</div>

<div style="background:#F0FFF4;border-left:4px solid #48BB78;padding:15px 20px;border-radius:12px;margin-bottom:25px;">
<p style="margin:0 0 5px 0;color:#2D3748;font-size:14px;"><strong>📞 ¿Necesitas ayuda para renovar?</strong></p>
<p style="margin:0;color:#4A5568;font-size:13px;">Contáctanos por WhatsApp al <strong style="color:${colors.primary};">33 3920 5098</strong> o por correo a <strong style="color:${colors.primary};">jherrera@renova-automatizacion.com</strong></p>
</div>

<div style="text-align:center;">
<a href="https://wa.me/5213339205098?text=Hola%2C%20quiero%20renovar%20mi%20suscripci%C3%B3n%20de%20TapCards" style="${buttonStyle(colors.primary)}">
📱 Contactar a Ventas
</a>
</div>

<p style="font-size:13px;color:${colors.muted};margin-top:26px;text-align:center;">
Si ya realizaste el pago, ignora este mensaje. Tu suscripción se actualizará automáticamente.
</p>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `⚠️ Tu suscripción ${planNombre} está por vencer - Renova TapCards`,
    html: getBaseTemplate(content, "Vencimiento de Suscripción")
  };

  return await transporter.sendMail(mailOptions);
};

const sendNotificacionManualEmail = async (email, nombre, planNombre, fechaFin) => {
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
<p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
Hola <strong>${nombre}</strong>,
</p>

<p style="color:${colors.text};font-size:16px;margin-bottom:25px;">
¡Felicidades! Nuestro equipo de administración ha activado tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong>.
</p>

<table width="100%" cellpadding="14" style="background:#F9FAFB;border-radius:12px;margin-bottom:30px;">
<tr>
<td style="border-bottom:1px solid ${colors.border};font-size:14px;color:${colors.text};">
<strong>📅 Fecha de inicio</strong><br>
${new Date().toLocaleDateString('es-MX')}
</td>
</tr>
<tr>
<td style="font-size:14px;color:${colors.text};">
<strong>📅 Fecha de vencimiento</strong><br>
${fechaFinFormateada}
</td>
</tr>
</table>

<div style="background:#E8FAF2;border-radius:10px;padding:20px;margin-bottom:28px;font-size:14px;color:${colors.text};line-height:1.6;">
<p style="margin:0;"><strong>✅ ¡Ya puedes disfrutar de todos los beneficios de tu plan!</strong></p>
<p style="margin:10px 0 0 0;">Accede a tu dashboard para comenzar a crear tus tarjetas digitales.</p>
</div>

<div style="text-align:center;">
<a href="${process.env.FRONTEND_URL}/dashboard" style="${buttonStyle(colors.primary)}">
🚀 Ir a mi Dashboard
</a>
</div>

<p style="font-size:13px;color:${colors.muted};margin-top:26px;text-align:center;">
Gracias por confiar en TapCards. ¡Estamos aquí para ayudarte a crecer!
</p>
`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `✅ Tu suscripción ${planNombre} ha sido activada - TapCards`,
    html: getBaseTemplate(content, "Suscripción Activada")
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVencimientoEmail,
  sendNotificacionManualEmail
};