const { generateQRCodeBase64, generateQRCodeBuffer, generateQRCodeSVG } = require("../utils/qr.utils");

const generateCustomQR = async (req, res) => {
  try {
    const { url, format = 'base64', size = 300, margin = 2, errorCorrection = 'M' } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL es requerida" });
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: "URL no válida" });
    }

    const qrOptions = {
      width: parseInt(size) || 300,
      margin: parseInt(margin) || 2,
      errorCorrectionLevel: errorCorrection
    };

    const allowedFormats = ['png', 'base64', 'svg'];
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({ error: "Formato no válido. Formatos permitidos: png, base64, svg" });
    }

    if (format === 'svg') {
      const qrSVG = await generateQRCodeSVG(url, qrOptions);
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(qrSVG);
    }

    if (format === 'png') {
      const qrBuffer = await generateQRCodeBuffer(url, qrOptions);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qr-custom.png"');
      return res.send(qrBuffer);
    }

    const qrBase64 = await generateQRCodeBase64(url, qrOptions);
    return res.json({
      success: true,
      url: url,
      qr: qrBase64,
      formato: 'base64',
      opciones: qrOptions
    });

  } catch (error) {
    console.error("Error en generateCustomQR:", error);
    return res.status(500).json({ error: "Error al generar el código QR" });
  }
};

module.exports = {
  generateCustomQR
};