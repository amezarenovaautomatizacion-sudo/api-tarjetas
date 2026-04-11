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
  <p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
    Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
  </p>
  
  <p style="color:${colors.textSecondary};font-size:15px;line-height:1.6;margin-bottom:25px;">
    Hemos recibido una solicitud para iniciar sesión en tu cuenta de TapCards. 
    Utiliza el siguiente código para completar la verificación en dos pasos:
  </p>
  
  <div style="text-align:center;margin:32px 0;">
    <div style="display:inline-block;background:rgba(13,184,211,0.1);border:2px solid rgba(13,184,211,0.3);border-radius:20px;padding:24px 40px;">
      <span style="font-size:44px;font-weight:800;letter-spacing:10px;color:${colors.primary};font-family:monospace;">${codigo}</span>
    </div>
  </div>
  
  <table width="100%" style="background:rgba(245,158,11,0.1);border-radius:14px;padding:20px;margin-bottom:28px;border-left:3px solid ${colors.warning};">
    <tr>
      <td style="font-size:14px;color:${colors.textSecondary};line-height:1.5;">
        <strong>⏰ Este código expirará en ${expiracionMinutos} minutos.</strong><br>
        Si no solicitaste este código, ignora este mensaje o cambia tu contraseña inmediatamente.
      </td>
    </tr>
  </table>
  
  <p style="font-size:13px;color:${colors.textMuted};text-align:center;margin-top:24px;">
    Por seguridad, nunca compartas este código con nadie. El equipo de TapCards nunca te pedirá este código.
  </p>
`;

const getBackupCodesTemplate = (nombre, backupCodes) => {
  const backupCodesList = backupCodes.map(code => `
    <div style="background:rgba(13,184,211,0.08);padding:12px 16px;margin:8px 0;border-radius:12px;font-family:monospace;font-size:14px;border:1px solid rgba(13,184,211,0.2);letter-spacing:1px;color:${colors.primaryLight};">
      ${code}
    </div>
  `).join('');

  return `
    <p style="color:${colors.text};font-size:16px;margin-bottom:20px;">
      Hola <strong style="color:${colors.primaryLight};">${nombre}</strong>
    </p>
    
    <p style="color:${colors.textSecondary};font-size:15px;line-height:1.6;margin-bottom:25px;">
      Has activado la verificación en dos pasos en tu cuenta de TapCards. Guarda estos códigos de respaldo en un lugar seguro.
    </p>
    
    <table width="100%" style="background:rgba(220,38,38,0.1);border-radius:14px;padding:20px;margin-bottom:25px;border-left:3px solid ${colors.danger};">
      <tr>
        <td style="font-size:13px;color:${colors.textSecondary};line-height:1.5;">
          <strong>⚠️ IMPORTANTE:</strong> Cada código puede usarse una sola vez para acceder a tu cuenta si no tienes acceso a tu código 2FA normal.<br><br>
          No compartas estos códigos con nadie. Si pierdes estos códigos y tu acceso al correo, no podrás acceder a tu cuenta.
        </td>
      </tr>
    </table>
    
    <div style="margin:25px 0;">
      <div style="font-weight:700;color:${colors.primaryLight};margin-bottom:15px;font-size:14px;">🔑 Tus códigos de respaldo:</div>
      ${backupCodesList}
    </div>
    
    <table width="100%" style="background:rgba(13,184,211,0.05);border-radius:12px;padding:16px;margin-top:20px;">
      <tr>
        <td style="font-size:12px;color:${colors.textMuted};">
          <strong>📝 Consejo de seguridad:</strong> Imprime esta página o guarda los códigos en un gestor de contraseñas. No los almacenes en tu correo electrónico.
        </td>
      </tr>
    </table>
  `;
};

const sendTwoFactorCodeEmail = async (email, nombre, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🔐 Código de verificación TapCards - ${codigo}`,
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