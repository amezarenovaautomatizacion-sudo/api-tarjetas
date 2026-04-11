module.exports = {
  colors: {
    primary: "#0DB8D3",
    primaryDark: "#1B7FDC",
    primaryLight: "#5FD9F0",
    secondary: "#4BCADF",
    accent: "#71E6D8",
    success: "#10b981",
    successLight: "#34d399",
    warning: "#f59e0b",
    warningDark: "#d97706",
    danger: "#dc2626",
    background: "#0a0e1a",
    cardBg: "#111827",
    text: "#ffffff",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    border: "rgba(31, 41, 55, 0.5)",
    borderLight: "rgba(75, 85, 99, 0.3)"
  },
  
  urls: {
    frontend: process.env.FRONTEND_URL || "https://tapcards.renova-automatizacion.com",
    api: process.env.API_URL || "https://api-tarjetas.vercel.app",
    logoUrl: process.env.LOGO_URL || "https://api-tarjetas.vercel.app/images/icon-512x512.png",
    whatsapp: "https://wa.me/5213339205098"
  },
  
  company: {
    name: "TapCards",
    tagline: "Tarjetas de Presentación Digitales",
    copyright: `© ${new Date().getFullYear()} TapCards - Todos los derechos reservados`,
    email: "jherrera@renova-automatizacion.com",
    phone: "33 3920 5098"
  }
};