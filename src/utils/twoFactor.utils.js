const crypto = require("crypto");

const generateTwoFactorCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }
  return codes;
};

const isCodeExpired = (expiracion) => {
  return new Date() > new Date(expiracion);
};

const isValidCode = (code) => {
  return /^\d{6}$/.test(code);
};

module.exports = {
  generateTwoFactorCode,
  generateBackupCodes,
  isCodeExpired,
  isValidCode
};