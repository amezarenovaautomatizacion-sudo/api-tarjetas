const { colors, urls, company } = require("./email.config");

const getBaseTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title ? `${title} | ${company.name}` : company.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    .ExternalClass, .ReadMsgBody { width: 100%; background-color: ${colors.background}; }
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 20px 10px !important; }
      .email-card { border-radius: 16px !important; }
      .email-body { padding: 24px 20px !important; }
      .email-header { padding: 28px 20px !important; }
      .email-footer { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${colors.background};font-family:'Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="padding:48px 20px;background:${colors.background};">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="email-card" style="background:${colors.cardBg};border-radius:28px;overflow:hidden;box-shadow:0 32px 64px rgba(0,0,0,0.5);border:1px solid rgba(13,184,211,0.12);">

          <!-- HEADER CON LOGO REAL -->
          <tr>
            <td class="email-header" style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg, #0a1628 0%, #0e1f3d 50%, #0a1628 100%);padding:36px 40px;border-bottom:1px solid rgba(13,184,211,0.2);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <!-- Logo imagen real -->
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:middle;padding-right:14px;">
                                <div style="width:52px;height:52px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,${colors.primary},${colors.primaryDark});padding:2px;box-shadow:0 0 20px rgba(13,184,211,0.4);">
                                  <img src="${urls.logoUrl}" alt="${company.name} Logo" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:12px;object-fit:cover;">
                                </div>
                              </td>
                              <td style="vertical-align:middle;">
                                <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;line-height:1;">${company.name}</div>
                                <div style="font-size:11px;color:${colors.primary};letter-spacing:0.12em;text-transform:uppercase;font-weight:600;margin-top:4px;">${company.tagline}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="text-align:right;vertical-align:middle;">
                          <div style="display:inline-block;background:rgba(13,184,211,0.12);border:1px solid rgba(13,184,211,0.25);border-radius:50px;padding:6px 14px;">
                            <span style="font-size:11px;color:${colors.primary};font-weight:600;letter-spacing:0.05em;">✦ DIGITAL</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Barra de acento -->
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.accent} 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>

          ${title ? `
          <!-- TÍTULO DE SECCIÓN -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="font-size:20px;font-weight:800;color:${colors.text};letter-spacing:-0.02em;position:relative;padding-left:18px;border-left:3px solid ${colors.primary};">
                ${title}
              </div>
              <div style="height:1px;background:linear-gradient(90deg, rgba(13,184,211,0.2) 0%, transparent 100%);margin-top:20px;"></div>
            </td>
          </tr>
          ` : ""}

          <!-- CONTENIDO -->
          <tr>
            <td class="email-body" style="padding:32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="background:rgba(0,0,0,0.25);border-top:1px solid rgba(13,184,211,0.1);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Links de navegación -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 6px;">
                          <a href="${urls.frontend}" style="color:${colors.primary};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.03em;">Inicio</a>
                        </td>
                        <td style="color:rgba(13,184,211,0.3);font-size:12px;">·</td>
                        <td style="padding:0 6px;">
                          <a href="${urls.frontend}/plantillas" style="color:${colors.primary};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.03em;">Plantillas</a>
                        </td>
                        <td style="color:rgba(13,184,211,0.3);font-size:12px;">·</td>
                        <td style="padding:0 6px;">
                          <a href="${urls.frontend}/planes" style="color:${colors.primary};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.03em;">Planes</a>
                        </td>
                        <td style="color:rgba(13,184,211,0.3);font-size:12px;">·</td>
                        <td style="padding:0 6px;">
                          <a href="${urls.whatsapp}" style="color:${colors.primary};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.03em;">Soporte</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Separador sutil -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <div style="height:1px;background:rgba(255,255,255,0.05);"></div>
                  </td>
                </tr>

                <!-- Logo footer + datos -->
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;vertical-align:middle;">
                          <img src="${urls.logoUrl}" alt="${company.name}" width="28" height="28" style="display:block;border-radius:8px;opacity:0.7;">
                        </td>
                        <td style="vertical-align:middle;text-align:left;">
                          <div style="font-weight:700;color:rgba(255,255,255,0.5);font-size:13px;">${company.name}</div>
                        </td>
                      </tr>
                    </table>
                    <div style="color:${colors.textMuted};font-size:11px;margin-top:10px;line-height:1.6;">${company.copyright}</div>
                    <div style="color:rgba(107,114,128,0.7);font-size:11px;margin-top:4px;">${company.email} · ${company.phone}</div>
                    <div style="color:rgba(107,114,128,0.5);font-size:10px;margin-top:10px;font-style:italic;">Mensaje automático — por favor no respondas a este correo.</div>
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
  padding:14px 36px;
  background:${bg};
  color:white !important;
  text-decoration:none;
  border-radius:50px;
  font-weight:700;
  font-size:14px;
  letter-spacing:0.04em;
  box-shadow:0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08) inset;
`;

const badgeStyle = (bg = "#0DB8D3") => `
  display:inline-block;
  padding:4px 14px;
  background:${bg};
  color:white;
  border-radius:50px;
  font-size:11px;
  font-weight:700;
  letter-spacing:0.05em;
  text-transform:uppercase;
`;

const infoRowStyle = () => `
  background:rgba(0,0,0,0.2);
  border-radius:16px;
  border:1px solid rgba(31,41,55,0.5);
  margin-bottom:28px;
  overflow:hidden;
`;

const alertStyle = (color = "#f59e0b") => `
  background:rgba(0,0,0,0.15);
  border-radius:14px;
  padding:20px;
  margin-bottom:28px;
  border-left:3px solid ${color};
`;

module.exports = {
  getBaseTemplate,
  buttonStyle,
  badgeStyle,
  infoRowStyle,
  alertStyle,
  colors: require("./email.config").colors
};