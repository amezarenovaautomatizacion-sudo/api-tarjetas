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

// Colores de la marca desde image.png
const colors = {
  primary: '#2690D8',
  secondary: '#4BCADF',
  accent: '#71E6D8',
  success: '#9AEDCE',
  light: '#C5F4D6',
  background: '#F2FBF3',
  dark: '#0449D1'
};

// Template base reutilizable
const getBaseTemplate = (content, title = '') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${colors.background};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.background}; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">RENOVA</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Tarjetas de Presentación</p>
            </td>
          </tr>
          
          <!-- Título si existe -->
          ${title ? `
          <tr>
            <td style="padding: 30px 30px 0 30px;">
              <h2 style="color: ${colors.dark}; margin: 0; font-size: 22px; font-weight: 400; border-bottom: 2px solid ${colors.accent}; padding-bottom: 10px;">${title}</h2>
            </td>
          </tr>
          ` : ''}
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 3px solid ${colors.accent};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: #6c757d; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 5px 0;"><strong>RENOVA</strong> - Tarjetas de Presentación</p>
                    <p style="margin: 0 0 5px 0;">📧 contacto@renova.com | 📞 (55) 1234-5678</p>
                    <p style="margin: 15px 0 0 0; font-size: 13px; border-top: 1px solid #dee2e6; padding-top: 15px;">
                      © 2026 RENOVA - Todos los derechos reservados<br>
                      <span style="color: #adb5bd;">Este es un mensaje automático, por favor no respondas a este correo.</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Estilos de botones reutilizables
const buttonStyle = (bgColor = colors.primary) => `
  display: inline-block;
  padding: 14px 28px;
  background-color: ${bgColor};
  color: #ffffff;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(38, 144, 216, 0.3);
  transition: all 0.3s ease;
  border: none;
`;

const getIpLocation = async (ip) => {
  try {
    if (!ip || ip === 'No disponible' || ip.includes('::') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return null;
    }
    
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    
    if (response.data.status === 'success') {
      return `${response.data.city}, ${response.data.regionName}, ${response.data.country}`;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo ubicación de IP:', error.message);
    return null;
  }
};

const sendWelcomeEmail = async (email, nombre, tipo = 'admin') => {
  const titles = {
    cliente: '¡Bienvenido a tu panel de cliente!',
    admin: '¡Bienvenido al panel de administración!'
  };

  const messages = {
    cliente: 'Ahora puedes acceder a tu panel de cliente y gestionar tus productos y facturación.',
    admin: 'Ahora puedes acceder al panel de administración para gestionar la plataforma.'
  };

  const content = `
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hola <strong style="color: ${colors.primary};">${nombre}</strong>,
    </p>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
      Gracias por registrarte en <strong style="color: ${colors.primary};">RENOVA</strong>. 
      Tu cuenta ha sido creada exitosamente y ya estás listo para comenzar.
    </p>
    
    <div style="background-color: ${colors.light}; border-left: 4px solid ${colors.primary}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
      <p style="color: ${colors.dark}; margin: 0; font-size: 16px; line-height: 1.6;">
        <strong>✨ ¿Qué sigue?</strong><br>
        ${messages[tipo]}
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/${tipo === 'cliente' ? 'cliente' : 'admin'}/dashboard" 
             style="${buttonStyle(colors.primary)}">
            Ir a mi panel →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
      ¿Tienes preguntas? Estamos aquí para ayudarte.<br>
      <a href="mailto:soporte@renova.com" style="color: ${colors.primary}; text-decoration: none;">soporte@renova.com</a>
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Bienvenido a RENOVA - ${tipo === 'cliente' ? 'Cliente' : 'Administrador'}`,
    html: getBaseTemplate(content, titles[tipo])
  };

  return await transporter.sendMail(mailOptions);
};

const sendLoginNotificationEmail = async (email, nombre, ip, tipo = 'admin') => {
  const location = await getIpLocation(ip);
  const fechaHora = new Date().toLocaleString('es-MX', { 
    timeZone: 'America/Mexico_City',
    dateStyle: 'full',
    timeStyle: 'long'
  });

  const titles = {
    cliente: 'Notificación de acceso - Cliente',
    admin: 'Notificación de acceso - Administrador'
  };

  const locationText = location ? location : '📍 Ubicación no disponible';
  const ipText = ip || 'No disponible';

  const content = `
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
      Hola <strong style="color: ${colors.primary};">${nombre}</strong>,
    </p>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
      Se ha detectado un nuevo inicio de sesión en tu cuenta de <strong style="color: ${colors.primary};">RENOVA</strong>.
    </p>
    
    <table width="100%" cellpadding="15" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 12px; margin-bottom: 30px;">
      <tr>
        <td style="border-bottom: 1px solid #dee2e6;">
          <strong style="color: ${colors.dark};">🕐 Fecha y hora:</strong><br>
          <span style="color: #495057;">${fechaHora}</span>
        </td>
      </tr>
      <tr>
        <td style="border-bottom: 1px solid #dee2e6;">
          <strong style="color: ${colors.dark};">🌍 Ubicación:</strong><br>
          <span style="color: #495057;">${locationText}</span>
        </td>
      </tr>
      <tr>
        <td>
          <strong style="color: ${colors.dark};">🔍 Dirección IP:</strong><br>
          <span style="color: #495057;">${ipText}</span>
        </td>
      </tr>
    </table>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #856404; margin: 0; font-size: 15px; line-height: 1.6;">
        <strong>⚠️ ¿No reconoces esta actividad?</strong><br>
        Si no fuiste tú quien inició sesión, te recomendamos cambiar tu contraseña inmediatamente.
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="${process.env.FRONTEND_URL}/${tipo === 'cliente' ? 'cliente' : 'admin'}/cambiar-contrasena" 
             style="${buttonStyle(colors.dark)}">
            Cambiar mi contraseña
          </a>
        </td>
      </tr>
    </table>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🔐 Nueva conexión detectada - RENOVA (${tipo === 'cliente' ? 'Cliente' : 'Admin'})`,
    html: getBaseTemplate(content, titles[tipo])
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, nombre, resetToken, tipo = 'admin') => {
  const resetUrl = tipo === 'cliente' 
    ? `${process.env.FRONTEND_URL}/cliente/reset-password?token=${resetToken}`
    : `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const content = `
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Hola <strong style="color: ${colors.primary};">${nombre}</strong>,
    </p>
    
    <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color: ${colors.primary};">RENOVA</strong>.
    </p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" style="${buttonStyle(colors.success)}">
        🔑 Restablecer mi contraseña
      </a>
    </div>
    
    <div style="background-color: #e7f3ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="color: ${colors.dark}; margin: 0 0 10px 0; font-size: 15px;">
        <strong>⏰ Este enlace expirará en 1 hora</strong>
      </p>
      <p style="color: #495057; margin: 0; font-size: 14px; line-height: 1.6;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${resetUrl}" style="color: ${colors.primary}; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    
    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-top: 25px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <strong>📌 ¿No solicitaste este cambio?</strong><br>
      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. 
      Tu cuenta permanecerá protegida.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔐 Restablece tu contraseña - RENOVA",
    html: getBaseTemplate(content, 'Solicitud de restablecimiento de contraseña')
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail
};