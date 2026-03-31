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

const getTwoFactorTemplate = (nombre, codigo, expiracionMinutos = 10) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F4FBF6;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">
<tr>
<td style="background:linear-gradient(135deg, #2690D8, #4BCADF);padding:35px 30px;text-align:center;">
<div style="font-size:32px;font-weight:800;color:white;letter-spacing:1px;">RENOVA</div>
<div style="color:rgba(255,255,255,0.9);margin-top:8px;font-size:13px;letter-spacing:1px;">Verificación de dos pasos</div>
</td>
</tr>
<tr>
<td style="padding:40px 35px;">
<p style="color:#2D3748;font-size:16px;margin-bottom:20px;">Hola <strong>${nombre}</strong>,</p>
<p style="color:#4A5568;font-size:15px;line-height:1.6;margin-bottom:25px;">
Hemos recibido una solicitud para iniciar sesión en tu cuenta. Utiliza el siguiente código para completar la verificación:
</p>
<div style="text-align:center;margin:30px 0;">
<div style="display:inline-block;background:#F7FAFC;border:2px solid #E2E8F0;border-radius:16px;padding:20px 35px;">
<span style="font-size:42px;font-weight:800;letter-spacing:8px;color:#2690D8;font-family:monospace;">${codigo}</span>
</div>
</div>
<div style="background:#F0FFF4;border-left:4px solid #48BB78;padding:18px 22px;border-radius:12px;margin:25px 0;">
<p style="margin:0;color:#2D3748;font-size:14px;">
<strong>⏰ Este código expirará en ${expiracionMinutos} minutos.</strong><br>
Si no solicitaste este código, ignora este mensaje o cambia tu contraseña inmediatamente.
</p>
</div>
<p style="color:#718096;font-size:13px;margin-top:25px;text-align:center;">
Mensaje automático - No responder a este correo.
</p>
</td>
</tr>
<tr>
<td style="background:#FAFAFA;border-top:1px solid #E5E7EB;padding:25px;text-align:center;">
<div style="font-weight:800;color:#0C2F66;margin-bottom:6px;">RENOVA</div>
<div style="color:#6B7280;font-size:12px;">© 2026 RENOVA - Todos los derechos reservados</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

const getBackupCodesTemplate = (nombre, backupCodes) => {
  const backupCodesList = backupCodes.map(code => `
    <div style="background:#F7FAFC;padding:12px 15px;margin:8px 0;border-radius:10px;font-family:monospace;font-size:14px;border:1px solid #E2E8F0;letter-spacing:1px;">
      ${code}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F4FBF6;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">
<tr>
<td style="background:linear-gradient(135deg, #2690D8, #4BCADF);padding:35px 30px;text-align:center;">
<div style="font-size:32px;font-weight:800;color:white;">RENOVA</div>
<div style="color:rgba(255,255,255,0.9);margin-top:8px;">Códigos de respaldo</div>
</td>
</tr>
<tr>
<td style="padding:40px 35px;">
<p style="color:#2D3748;font-size:16px;">Hola <strong>${nombre}</strong>,</p>
<p style="color:#4A5568;margin:20px 0;">Has activado la verificación de dos pasos. Guarda estos códigos en un lugar seguro. Cada código puede usarse una sola vez para acceder a tu cuenta si no tienes acceso al código 2FA normal.</p>
<div style="background:#FFF5F5;border-left:4px solid #F56565;padding:15px;margin:20px 0;border-radius:8px;">
<p style="margin:0;color:#C53030;font-size:13px;"><strong>⚠️ IMPORTANTE:</strong> Estos códigos son de un solo uso. No los compartas con nadie. Si pierdes estos códigos y tu acceso al correo, no podrás acceder a tu cuenta.</p>
</div>
<div style="margin:25px 0;">
<h4 style="color:#2D3748;margin-bottom:15px;">Tus códigos de respaldo:</h4>
${backupCodesList}
</div>
<div style="background:#EBF8FF;padding:15px;border-radius:8px;margin-top:20px;">
<p style="margin:0;color:#2B6CB0;font-size:13px;"><strong>📝 Consejo:</strong> Imprime esta página o guarda los códigos en un gestor de contraseñas.</p>
</div>
<p style="color:#718096;font-size:13px;margin-top:25px;text-align:center;">Mensaje automático - No responder a este correo.</p>
</td>
</tr>
<tr>
<td style="background:#FAFAFA;border-top:1px solid #E5E7EB;padding:25px;text-align:center;">
<div style="font-weight:800;color:#0C2F66;margin-bottom:6px;">RENOVA</div>
<div style="color:#6B7280;font-size:12px;">© 2026 RENOVA - Todos los derechos reservados</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
  `;
};

const sendTwoFactorCodeEmail = async (email, nombre, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔐 Código de verificación RENOVA",
    html: getTwoFactorTemplate(nombre, codigo)
  };
  return await transporter.sendMail(mailOptions);
};

const sendBackupCodesEmail = async (email, nombre, backupCodes) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "📋 Tus códigos de respaldo RENOVA",
    html: getBackupCodesTemplate(nombre, backupCodes)
  };
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendTwoFactorCodeEmail,
  sendBackupCodesEmail
};