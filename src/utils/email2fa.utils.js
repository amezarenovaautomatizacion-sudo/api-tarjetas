const nodemailer = require("nodemailer");
const { getBaseTemplate, buttonStyle, colors } = require("./emailBase.utils");
const { company } = require("./email.config");

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
  <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
    Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
  </p>

  <p style="color:${colors.textSecondary};font-size:15px;line-height:1.7;margin-bottom:28px;">
    Hemos recibido una solicitud para iniciar sesión en tu cuenta de TapCards.
    Utiliza el siguiente código para completar la verificación en dos pasos:
  </p>

  <div style="text-align:center;margin:36px 0;">
    <div style="display:inline-block;background:rgba(13,184,211,0.06);border:1px solid rgba(13,184,211,0.25);border-radius:24px;padding:28px 48px;position:relative;">
      <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">Código de verificación</div>
      <div style="font-size:48px;font-weight:800;letter-spacing:12px;color:${colors.primary};font-family:'Courier New',Courier,monospace;line-height:1;">${codigo}</div>
      <div style="font-size:11px;color:${colors.textMuted};margin-top:14px;">Válido por <strong style="color:${colors.textSecondary};">${expiracionMinutos} minutos</strong></div>
    </div>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.08);border-radius:14px;padding:18px 20px;margin-bottom:28px;border-left:3px solid ${colors.warning};">
    <tr>
      <td style="font-size:13px;color:${colors.textSecondary};line-height:1.6;">
        <strong style="color:${colors.warning};">⏰ Este código expirará en ${expiracionMinutos} minutos.</strong><br>
        Si no solicitaste este código, ignora este mensaje o cambia tu contraseña inmediatamente.
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.15);border-radius:12px;padding:16px 20px;">
    <tr>
      <td style="font-size:12px;color:${colors.textMuted};line-height:1.6;text-align:center;">
        🔒 Por seguridad, <strong>nunca compartas este código</strong> con nadie.<br>El equipo de ${company.name} jamás te solicitará este código.
      </td>
    </tr>
  </table>
`;

const getBackupCodesTemplate = (nombre, backupCodes) => {
  const backupCodesList = backupCodes.map((code, i) => `
    <tr>
      <td style="padding:10px 16px;${i < backupCodes.length - 1 ? `border-bottom:1px solid rgba(13,184,211,0.08);` : ""}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:24px;vertical-align:middle;">
              <div style="font-size:11px;color:${colors.textMuted};font-weight:600;">${String(i + 1).padStart(2, "0")}</div>
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:${colors.primaryLight};letter-spacing:3px;">${code}</div>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <div style="display:inline-block;background:rgba(16,185,129,0.1);border-radius:50px;padding:3px 10px;">
                <span style="font-size:10px;color:${colors.success};font-weight:700;letter-spacing:0.05em;">ACTIVO</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `
    <p style="color:${colors.text};font-size:16px;margin-bottom:8px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>

    <p style="color:${colors.textSecondary};font-size:15px;line-height:1.7;margin-bottom:28px;">
      Has activado la verificación en dos pasos en tu cuenta de TapCards. 
      Guarda estos códigos de respaldo en un lugar seguro — son tu llave maestra.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(220,38,38,0.07);border-radius:14px;padding:18px 20px;margin-bottom:28px;border-left:3px solid ${colors.danger};">
      <tr>
        <td style="font-size:13px;color:${colors.textSecondary};line-height:1.7;">
          <strong style="color:${colors.danger};">⚠️ IMPORTANTE:</strong> Cada código puede usarse <strong>una sola vez</strong>.<br>
          No compartas estos códigos con nadie. Si los pierdes junto con tu acceso 2FA, no podrás recuperar tu cuenta.
        </td>
      </tr>
    </table>

    <div style="margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:${colors.primary};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">🔑 Tus códigos de respaldo</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.25);border-radius:16px;border:1px solid rgba(13,184,211,0.12);overflow:hidden;">
        ${backupCodesList}
      </table>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,184,211,0.05);border-radius:12px;padding:16px 20px;margin-top:20px;">
      <tr>
        <td style="font-size:12px;color:${colors.textMuted};line-height:1.6;">
          <strong style="color:${colors.textSecondary};">📝 Consejo de seguridad:</strong> Imprime esta página o guárdalos en un gestor de contraseñas. No los almacenes solo en tu correo electrónico.
        </td>
      </tr>
    </table>
  `;
};

const sendTwoFactorCodeEmail = async (email, nombre, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🔐 Tu código de verificación TapCards: ${codigo}`,
    html: getBaseTemplate(getTwoFactorTemplate(nombre, codigo), "🔐 Verificación en dos pasos")
  };
  return await transporter.sendMail(mailOptions);
};

const sendBackupCodesEmail = async (email, nombre, backupCodes) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "📋 Tus códigos de respaldo - TapCards",
    html: getBaseTemplate(getBackupCodesTemplate(nombre, backupCodes), "📋 Códigos de respaldo 2FA")
  };
  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendTwoFactorCodeEmail,
  sendBackupCodesEmail
};