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
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  let mensajeAdvertencia = "";
  let colorAdvertencia = colors.primary;
  let iconoEstado = "⏰";
  let estadoLabel = "";

  if (diasRestantes <= 0) {
    mensajeAdvertencia = "Tu suscripción ya ha expirado. Renueva ahora para seguir disfrutando de todos los beneficios de TapCards.";
    colorAdvertencia = colors.danger;
    iconoEstado = "❌";
    estadoLabel = "SUSCRIPCIÓN VENCIDA";
  } else if (diasRestantes <= 3) {
    mensajeAdvertencia = `¡ATENCIÓN! Tu suscripción vencerá en ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}. ¡No esperes más para renovar!`;
    colorAdvertencia = colors.warning;
    iconoEstado = "⚠️";
    estadoLabel = `${diasRestantes} día${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`;
  } else {
    mensajeAdvertencia = `Te recomendamos renovar con anticipación para no perder el acceso.`;
    colorAdvertencia = colors.primary;
    iconoEstado = "📅";
    estadoLabel = `${diasRestantes} días restantes`;
  }

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;line-height:1.7;">
      Te recordamos que tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong> está próxima a vencer.
    </p>

    <!-- Estado visual -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:rgba(0,0,0,0.25);border-radius:20px;padding:24px 40px;border:1px solid rgba(${colorAdvertencia === colors.danger ? "220,38,38" : colorAdvertencia === colors.warning ? "245,158,11" : "13,184,211"},0.25);">
        <div style="font-size:32px;margin-bottom:8px;">${iconoEstado}</div>
        <div style="font-size:18px;font-weight:800;color:${colorAdvertencia};letter-spacing:-0.01em;">${estadoLabel}</div>
        <div style="font-size:12px;color:${colors.textMuted};margin-top:6px;">Vence el ${fechaFinFormateada}</div>
      </div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.2);border-radius:18px;margin-bottom:28px;border:1px solid rgba(31,41,55,0.5);overflow:hidden;">
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid rgba(31,41,55,0.5);">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📅 Fecha de vencimiento</div>
          <div style="font-size:14px;color:${colors.text};">${fechaFinFormateada}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📋 Plan actual</div>
          <div style="font-size:14px;color:${colors.text};">${planNombre}</div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(${colorAdvertencia === colors.danger ? "220,38,38" : colorAdvertencia === colors.warning ? "245,158,11" : "13,184,211"},0.08);border-radius:14px;padding:18px 20px;margin-bottom:28px;border-left:3px solid ${colorAdvertencia};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.6;">
          <strong style="color:${colorAdvertencia};">⚠️ ${mensajeAdvertencia}</strong><br><br>
          Renueva tu suscripción para no perder acceso a tus tarjetas digitales y todos los beneficios de TapCards.
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,184,211,0.05);border-radius:14px;padding:18px 20px;margin-bottom:28px;border:1px solid rgba(13,184,211,0.1);">
      <tr>
        <td style="font-size:13px;color:${colors.textSecondary};line-height:1.6;">
          <strong style="color:${colors.primaryLight};">📞 ¿Necesitas ayuda para renovar?</strong><br>
          Contáctanos por WhatsApp al <strong style="color:${colors.primary};">${company.phone}</strong> o por correo a <strong style="color:${colors.primary};">${company.email}</strong>
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <a href="${urls.whatsapp}?text=Hola%2C%20quiero%20renovar%20mi%20suscripci%C3%B3n%20de%20TapCards" style="${buttonStyle(colors.primary)}">
        📱 Contactar a Ventas por WhatsApp
      </a>
    </div>

    <p style="font-size:12px;color:${colors.textMuted};margin-top:24px;text-align:center;line-height:1.6;">
      Si ya realizaste el pago, ignora este mensaje.<br>Tu suscripción se actualizará automáticamente en las próximas 24 horas.
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
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong> 🎉
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;line-height:1.7;">
      ¡Felicidades! Nuestro equipo de administración ha activado tu suscripción al plan <strong style="color:${colors.primary};">${planNombre}</strong>.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:rgba(16,185,129,0.08);border-radius:20px;padding:24px 40px;border:1px solid rgba(16,185,129,0.2);">
        <div style="font-size:32px;margin-bottom:8px;">✅</div>
        <div style="font-size:16px;font-weight:800;color:${colors.success};">Suscripción Activa</div>
        <div style="font-size:12px;color:${colors.textMuted};margin-top:6px;">Plan ${planNombre}</div>
      </div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.2);border-radius:18px;margin-bottom:28px;border:1px solid rgba(31,41,55,0.5);overflow:hidden;">
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid rgba(31,41,55,0.5);">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📅 Fecha de activación</div>
          <div style="font-size:14px;color:${colors.text};">${new Date().toLocaleDateString("es-MX")}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📅 Válido hasta</div>
          <div style="font-size:14px;color:${colors.text};">${fechaFinFormateada}</div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.08);border-radius:14px;padding:18px 20px;margin-bottom:28px;border-left:3px solid ${colors.success};">
      <tr>
        <td style="font-size:14px;color:${colors.textSecondary};line-height:1.6;">
          <strong style="color:${colors.successLight};">✅ ¡Ya puedes disfrutar de todos los beneficios de tu plan!</strong><br><br>
          Accede a tu dashboard para comenzar a crear tus tarjetas digitales profesionales. Con TapCards, tus clientes siempre tendrán tu información actualizada.
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:28px 0;">
      <a href="${urls.frontend}/dashboard" style="${buttonStyle(colors.success)}">
        🚀 Ir a mi Dashboard
      </a>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,184,211,0.05);border-radius:12px;padding:16px 20px;margin-top:8px;">
      <tr>
        <td style="font-size:12px;color:${colors.textMuted};text-align:center;line-height:1.6;">
          💡 <strong>Tip:</strong> Personaliza tus tarjetas con colores, logos y enlaces a tus redes sociales para causar una mejor impresión profesional.
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:${colors.textMuted};margin-top:24px;text-align:center;">
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
  const fechaFinFormateada = new Date(fechaFin).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const content = `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong> 🎉
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;margin-bottom:28px;line-height:1.7;">
      ¡Gracias por renovar! Tu plan <strong style="color:${colors.primary};">${planNombre}</strong> ha sido renovado exitosamente y ya está activo.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:rgba(16,185,129,0.08);border-radius:20px;padding:24px 48px;border:1px solid rgba(16,185,129,0.2);">
        <div style="font-size:36px;margin-bottom:8px;">🎉</div>
        <div style="font-size:16px;font-weight:800;color:${colors.success};">¡Renovación exitosa!</div>
        <div style="font-size:12px;color:${colors.textMuted};margin-top:6px;">Plan ${planNombre}</div>
      </div>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.2);border-radius:18px;margin-bottom:28px;border:1px solid rgba(31,41,55,0.5);overflow:hidden;">
      <tr>
        <td style="padding:18px 20px;border-bottom:1px solid rgba(31,41,55,0.5);">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📅 Fecha de renovación</div>
          <div style="font-size:14px;color:${colors.text};">${new Date().toLocaleDateString("es-MX")}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📅 Nueva fecha de vencimiento</div>
          <div style="font-size:14px;color:${colors.text};">${fechaFinFormateada}</div>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:28px 0;">
      <a href="${urls.frontend}/dashboard" style="${buttonStyle(colors.success)}">
        🚀 Continuar usando TapCards
      </a>
    </div>

    <p style="font-size:12px;color:${colors.textMuted};margin-top:24px;text-align:center;">
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