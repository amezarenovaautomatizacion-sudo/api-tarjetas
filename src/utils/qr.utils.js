const QRCode = require("qrcode");

const generateQRCodeBase64 = async (url, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };
  const qrOptions = { ...defaultOptions, ...options };
  return await QRCode.toDataURL(url, qrOptions);
};

const generateQRCodeBuffer = async (url, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300
  };
  const qrOptions = { ...defaultOptions, ...options };
  return await QRCode.toBuffer(url, qrOptions);
};

const generateQRCodeSVG = async (url, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300
  };
  const qrOptions = { ...defaultOptions, ...options };
  return await QRCode.toString(url, { type: 'svg', ...qrOptions });
};

module.exports = {
  generateQRCodeBase64,
  generateQRCodeBuffer,
  generateQRCodeSVG
};