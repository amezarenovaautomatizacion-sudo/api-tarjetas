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
  const subject = tipo === 'cliente' 
    ? "Bienvenido a Tarjetas Renova - Cliente"
    : "Bienvenido a Tarjetas Renova - Administrador";

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: `
      <h1>¡Hola ${nombre}!</h1>
      <p>Gracias por registrarte en <strong>Tarjetas Renova</strong>.</p>
      <p>Tu cuenta ha sido creada exitosamente.</p>
      ${tipo === 'cliente' 
        ? '<p>Ahora puedes acceder a tu panel de cliente y gestionar tus productos y facturación.</p>' 
        : '<p>Ahora puedes acceder al panel de administración.</p>'}
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <br>
      <p>Saludos,<br>El equipo de Tarjetas Renova</p>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const sendLoginNotificationEmail = async (email, nombre, ip, tipo = 'admin') => {
  const location = await getIpLocation(ip);
  
  const subject = tipo === 'cliente'
    ? "Notificación de inicio de sesión - Cliente"
    : "Notificación de inicio de sesión - Administrador";

  const locationText = location ? location : 'ubicación no disponible';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: `
      <h1>Hola ${nombre}</h1>
      <p>Se ha detectado un inicio de sesión en tu cuenta de <strong>Tarjetas Renova</strong>.</p>
      <p><strong>Ubicación aproximada:</strong> ${locationText}</p>
      <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
      <p>Si no fuiste tú, por favor cambia tu contraseña inmediatamente.</p>
      <br>
      <p>Saludos,<br>El equipo de Tarjetas Renova</p>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, nombre, resetToken, tipo = 'admin') => {
  const resetUrl = tipo === 'cliente' 
    ? `${process.env.FRONTEND_URL}/cliente/reset-password?token=${resetToken}`
    : `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Recuperación de contraseña - Tarjetas Renova",
    html: `
      <h1>Hola ${nombre}</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail
};