const nodemailer = require("nodemailer");
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

const sendVencimientoEmail = async (email, nombre, diasRestantes, fechaFin, planNombre) => {
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let mensajeAdvertencia = "";
  let colorAdvertencia = colors.primary;
  
  if (diasRestantes <= 0) {
    mensajeAdvertencia = "❌ Tu suscripción ya ha expirado. Renueva ahora para seguir disfrutando de todos los beneficios de TapCards.";
    colorAdvertencia = colors.danger;
  } else if (diasRestantes <= 3) {
    mensajeAdvertencia = `⚠️ ¡ATENCIÓN! Tu suscripción vencerá en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}. ¡No esperes más para renovar!`;
    colorAdvertencia = colors.warning;
  } else {
    mensajeAdvertencia = `Tu suscripción vencerá en ${diasRestantes} días. Te recomendamos renovar con anticipación.`;
  }

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:25px;">
      Te recordamos que tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong> está por vencer.
    </p>
    
    <table width="100%" cellpadding="14" style="background:rgba(0,0,0,0.2);border-radius:16px;margin-bottom:30px;border:1px solid ${colors.border};">
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">📅 Fecha de vencimiento</strong><br>
          <span style="color:${colors.textSecondary};">${fechaFinFormateada}</span>
        </td>
      </tr>
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">⏰ Estado</strong><br>
          <span style="color:${colorAdvertencia};font-weight:bold;">${diasRestantes <= 0 ? 'SUSCRIPCIÓN VENCIDA' : `${diasRestantes} días restantes`}</span>
        </td>
      </tr>
      <tr>
        <td>
          <strong style="color:${colors.primaryLight};">📋 Plan actual</strong><br>
          <span style="color:${colors.textSecondary};">${planNombre}</span>
        </td>
      </tr>
    </table>
    
    <table width="100%" style="background:rgba(245,158,11,0.1);border-radius:14px;padding:20px;margin-bottom:28px;border-left:3px solid ${colorAdvertencia};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.5;">
          <strong>${mensajeAdvertencia}</strong><br><br>
          Renueva tu suscripción para no perder acceso a tus tarjetas digitales y seguir disfrutando de todos los beneficios de TapCards.
        </td>
      </tr>
    </table>
    
    <div style="background:rgba(13,184,211,0.05);border-radius:14px;padding:20px;margin-bottom:25px;">
      <p style="margin:0 0 10px 0;color:${colors.textSecondary};font-size:14px;">
        <strong style="color:${colors.primaryLight};">📞 ¿Necesitas ayuda para renovar?</strong><br>
        Contáctanos por WhatsApp al <strong style="color:${colors.primary};">${company.phone}</strong> o por correo a <strong style="color:${colors.primary};">${company.email}</strong>
      </p>
    </div>
    
    <div style="text-align:center;">
      <a href="${urls.whatsapp}?text=Hola%2C%20quiero%20renovar%20mi%20suscripci%C3%B3n%20de%20TapCards" style="${buttonStyle(colors.primary)}">
        📱 Contactar a Ventas
      </a>
    </div>
    
    <p style="font-size:12px;color:${colors.textMuted};margin-top:28px;text-align:center;">
      Si ya realizaste el pago, ignora este mensaje. Tu suscripción se actualizará automáticamente en las próximas 24 horas.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `⚠️ Tu suscripción ${planNombre} está por vencer - TapCards`,
    html: getBaseTemplate(content, "⚠️ Vencimiento de Suscripción")
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
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:25px;">
      🎉 ¡Felicidades! Nuestro equipo de administración ha activado tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong>.
    </p>
    
    <table width="100%" cellpadding="14" style="background:rgba(0,0,0,0.2);border-radius:16px;margin-bottom:30px;border:1px solid ${colors.border};">
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">📅 Fecha de activación</strong><br>
          <span style="color:${colors.textSecondary};">${new Date().toLocaleDateString('es-MX')}</span>
        </td>
      </tr>
      <tr>
        <td>
          <strong style="color:${colors.primaryLight};">📅 Fecha de vencimiento</strong><br>
          <span style="color:${colors.textSecondary};">${fechaFinFormateada}</span>
        </td>
      </tr>
    </table>
    
    <table width="100%" style="background:rgba(16,185,129,0.1);border-radius:14px;padding:20px;margin-bottom:28px;border-left:3px solid ${colors.success};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.5;">
          <strong>✅ ¡Ya puedes disfrutar de todos los beneficios de tu plan!</strong><br><br>
          Accede a tu dashboard para comenzar a crear tus tarjetas digitales profesionales. 
          Con TapCards, tus clientes siempre tendrán tu información actualizada.
        </td>
      </tr>
    </table>
    
    <div style="text-align:center;margin:20px 0;">
      <a href="${urls.frontend}/dashboard" style="${buttonStyle(colors.success)}">
        🚀 Ir a mi Dashboard
      </a>
    </div>
    
    <div style="background:rgba(13,184,211,0.05);border-radius:12px;padding:16px;margin-top:20px;">
      <p style="margin:0;font-size:13px;color:${colors.textMuted};text-align:center;">
        💡 <strong>Tip:</strong> Personaliza tus tarjetas con colores, logos y enlaces a tus redes sociales para causar una mejor impresión.
      </p>
    </div>
    
    <p style="font-size:13px;color:${colors.textMuted};margin-top:28px;text-align:center;">
      Gracias por confiar en TapCards. ¡Estamos aquí para ayudarte a crecer!
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `✅ Tu suscripción ${planNombre} ha sido activada - TapCards`,
    html: getBaseTemplate(content, "✅ Suscripción Activada")
  };

  return await transporter.sendMail(mailOptions);
};

const sendRenovacionExitosaEmail = async (email, nombre, planNombre, fechaFin) => {
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:25px;">
      🎉 ¡Gracias por renovar tu suscripción! Tu plan <strong style="color:${colors.primary};">${planNombre}</strong> ha sido renovado exitosamente.
    </p>
    
    <table width="100%" cellpadding="14" style="background:rgba(0,0,0,0.2);border-radius:16px;margin-bottom:30px;border:1px solid ${colors.border};">
      <tr>
        <td style="border-bottom:1px solid ${colors.border};">
          <strong style="color:${colors.primaryLight};">📅 Fecha de renovación</strong><br>
          <span style="color:${colors.textSecondary};">${new Date().toLocaleDateString('es-MX')}</span>
        </td>
      </tr>
      <tr>
        <td>
          <strong style="color:${colors.primaryLight};">📅 Nueva fecha de vencimiento</strong><br>
          <span style="color:${colors.textSecondary};">${fechaFinFormateada}</span>
        </td>
      </tr>
    </table>
    
    <div style="text-align:center;margin:20px 0;">
      <a href="${urls.frontend}/dashboard" style="${buttonStyle(colors.success)}">
        🚀 Continuar usando TapCards
      </a>
    </div>
    
    <p style="font-size:13px;color:${colors.textMuted};margin-top:28px;text-align:center;">
      Gracias por preferir TapCards para tus tarjetas digitales. ¡Sigue creciendo con nosotros!
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🎉 ¡Renovación exitosa! - TapCards ${planNombre}`,
    html: getBaseTemplate(content, "🎉 Suscripción Renovada")
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVencimientoEmail,
  sendNotificacionManualEmail,
  sendRenovacionExitosaEmail
};