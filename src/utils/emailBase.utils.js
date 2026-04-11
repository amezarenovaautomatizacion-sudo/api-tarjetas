const { colors, urls, company } = require("./email.config");

const getBaseTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title ? `${title} | ${company.name}` : company.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    .ExternalClass, .ReadMsgBody { width: 100%; background-color: ${colors.background}; }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;background:${colors.background};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:${colors.background};">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:${colors.cardBg};border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:1px solid ${colors.border};">
          
          <tr>
            <td style="background:linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});padding:35px 30px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${urls.logoUrl}" alt="${company.name}" width="60" height="60" style="display:block;border-radius:16px;margin-bottom:16px;">
                    <div style="font-size:28px;font-weight:800;color:white;letter-spacing:-0.02em;">${company.name}</div>
                    <div style="color:rgba(255,255,255,0.85);margin-top:6px;font-size:13px;letter-spacing:0.5px;">${company.tagline}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${title ? `
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="font-size:22px;font-weight:800;color:${colors.text};border-left:3px solid ${colors.primary};padding-left:16px;margin-bottom:0;">
                ${title}
              </div>
            </td>
          </tr>
          ` : ""}
          
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          
          <tr>
            <td style="background:rgba(0,0,0,0.2);border-top:1px solid ${colors.border};padding:28px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${urls.frontend}" style="color:${colors.primaryLight};text-decoration:none;font-size:13px;font-weight:500;margin:0 12px;">Inicio</a>
                    <span style="color:${colors.textMuted};">|</span>
                    <a href="${urls.frontend}/plantillas" style="color:${colors.primaryLight};text-decoration:none;font-size:13px;font-weight:500;margin:0 12px;">Plantillas</a>
                    <span style="color:${colors.textMuted};">|</span>
                    <a href="${urls.frontend}/planes" style="color:${colors.primaryLight};text-decoration:none;font-size:13px;font-weight:500;margin:0 12px;">Planes</a>
                    <span style="color:${colors.textMuted};">|</span>
                    <a href="${urls.whatsapp}" style="color:${colors.primaryLight};text-decoration:none;font-size:13px;font-weight:500;margin:0 12px;">Soporte</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="font-weight:700;color:${colors.primaryLight};margin-bottom:8px;font-size:14px;">${company.name}</div>
                    <div style="color:${colors.textMuted};font-size:12px;margin-bottom:4px;">${company.copyright}</div>
                    <div style="color:${colors.textMuted};font-size:11px;">${company.email} | ${company.phone}</div>
                    <div style="color:${colors.textMuted};font-size:11px;margin-top:8px;">Este es un mensaje automático, por favor no responder a este correo.</div>
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

const buttonStyle = (bg = "#0DB8D3") => `
  display:inline-block;
  padding:14px 32px;
  background:${bg};
  color:white !important;
  text-decoration:none;
  border-radius:50px;
  font-weight:600;
  font-size:14px;
  letter-spacing:0.3px;
  transition:all 0.2s ease;
  box-shadow:0 4px 12px rgba(0,0,0,0.15);
`;

const badgeStyle = (bg = "#0DB8D3") => `
  display:inline-block;
  padding:4px 12px;
  background:${bg};
  color:white;
  border-radius:50px;
  font-size:12px;
  font-weight:600;
`;

module.exports = {
  getBaseTemplate,
  buttonStyle,
  badgeStyle,
  colors: require("./email.config").colors
};