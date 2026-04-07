const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const plantillaRoutes = require("./routes/plantilla.routes");
const tarjetaClienteRoutes = require("./routes/tarjetaCliente.routes");
const qrRoutes = require("./routes/qr.routes");
const twoFactorRoutes = require("./routes/twoFactor.routes");
const suscripcionRoutes = require("./routes/suscripcion.routes");

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:8080',
      'https://api-tarjetas.vercel.app',
      'https://tarjetas-digitales-murex.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  const endpoints = {
    api: "Tarjetas Renova API",
    version: "1.6.0",
    base_url: baseUrl,
    documentacion: "Para una vista más detallada, accede a /docs",
    endpoints: {
      administradores: {
        registro: {
          metodo: "POST",
          url: "/api/register",
          descripcion: "Registrar nuevo administrador/editor/visitante",
          autenticacion: false,
          body: {
            nombre: "string (requerido)",
            email: "string (requerido)",
            password: "string (requerido, mínimo 6 caracteres)",
            ip_registro: "string (opcional)"
          }
        },
        login: {
          metodo: "POST",
          url: "/api/login",
          descripcion: "Iniciar sesión como administrador",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            password: "string (requerido)",
            ip_ultimo_login: "string (opcional)",
            tipo: "string (opcional, por defecto 'admin')"
          }
        },
        perfil: {
          metodo: "GET",
          url: "/api/profile",
          descripcion: "Obtener perfil del administrador",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        logout: {
          metodo: "POST",
          url: "/api/logout",
          descripcion: "Cerrar sesión de administrador",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        cambiarPassword: {
          metodo: "PUT",
          url: "/api/change-password",
          descripcion: "Cambiar contraseña de administrador",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            password_actual: "string (requerido)",
            password_nuevo: "string (requerido, mínimo 6 caracteres)"
          }
        },
        olvidePassword: {
          metodo: "POST",
          url: "/api/forgot-password",
          descripcion: "Solicitar recuperación de contraseña (admin)",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            tipo: "string (opcional, por defecto 'admin')"
          }
        },
        resetPassword: {
          metodo: "POST",
          url: "/api/reset-password",
          descripcion: "Restablecer contraseña de administrador",
          autenticacion: false,
          body: {
            token: "string (requerido)",
            new_password: "string (requerido, mínimo 6 caracteres)",
            tipo: "string (opcional, por defecto 'admin')"
          }
        }
      },
      clientes: {
        registro: {
          metodo: "POST",
          url: "/api/cliente/register",
          descripcion: "Registrar nuevo cliente con información detallada",
          autenticacion: false,
          body: {
            nombre: "string (requerido)",
            email: "string (requerido)",
            password: "string (requerido, mínimo 6 caracteres)",
            ip_registro: "string (opcional)",
            telefono: "string (opcional)",
            telefono_alternativo: "string (opcional)",
            fecha_nacimiento: "date (opcional, YYYY-MM-DD)",
            genero: "string (opcional, M/F/Otro)",
            calle: "string (opcional)",
            numero_exterior: "string (opcional)",
            numero_interior: "string (opcional)",
            colonia: "string (opcional)",
            ciudad: "string (opcional)",
            estado: "string (opcional)",
            pais: "string (opcional, por defecto 'México')",
            codigo_postal: "string (opcional)",
            referencias: "string (opcional)",
            razon_social: "string (opcional)",
            rfc: "string (opcional)",
            regimen_fiscal: "string (opcional)",
            cfdi_uso: "string (opcional)",
            email_facturacion: "string (opcional)",
            notas: "string (opcional)"
          }
        },
        login: {
          metodo: "POST",
          url: "/api/cliente/login",
          descripcion: "Iniciar sesión como cliente",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            password: "string (requerido)",
            ip_ultimo_login: "string (opcional)"
          }
        },
        perfil: {
          metodo: "GET",
          url: "/api/cliente/profile",
          descripcion: "Obtener perfil del cliente (incluye información detallada)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        actualizarPerfil: {
          metodo: "PUT",
          url: "/api/cliente/update-profile",
          descripcion: "Actualizar información detallada del cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            telefono: "string (opcional)",
            telefono_alternativo: "string (opcional)",
            fecha_nacimiento: "date (opcional)",
            genero: "string (opcional)",
            calle: "string (opcional)",
            numero_exterior: "string (opcional)",
            numero_interior: "string (opcional)",
            colonia: "string (opcional)",
            ciudad: "string (opcional)",
            estado: "string (opcional)",
            pais: "string (opcional)",
            codigo_postal: "string (opcional)",
            referencias: "string (opcional)",
            razon_social: "string (opcional)",
            rfc: "string (opcional)",
            regimen_fiscal: "string (opcional)",
            cfdi_uso: "string (opcional)",
            email_facturacion: "string (opcional)",
            notas: "string (opcional)"
          }
        },
        logout: {
          metodo: "POST",
          url: "/api/cliente/logout",
          descripcion: "Cerrar sesión de cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        cambiarPassword: {
          metodo: "PUT",
          url: "/api/cliente/change-password",
          descripcion: "Cambiar contraseña de cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            password_actual: "string (requerido)",
            password_nuevo: "string (requerido, mínimo 6 caracteres)"
          }
        },
        olvidePassword: {
          metodo: "POST",
          url: "/api/cliente/forgot-password",
          descripcion: "Solicitar recuperación de contraseña (cliente)",
          autenticacion: false,
          body: {
            email: "string (requerido)"
          }
        },
        resetPassword: {
          metodo: "POST",
          url: "/api/cliente/reset-password",
          descripcion: "Restablecer contraseña de cliente",
          autenticacion: false,
          body: {
            token: "string (requerido)",
            new_password: "string (requerido, mínimo 6 caracteres)"
          }
        },
        tarjetas: {
          crear: {
            metodo: "POST",
            url: "/api/cliente/tarjetas",
            descripcion: "Crear una nueva tarjeta para el cliente",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            body: {
              plantillaid: "number (requerido)",
              nombre_tarjeta: "string (requerido)",
              datos: "object (requerido, JSON con los datos de la tarjeta)",
              visibilidad: "string (opcional, 'publico' o 'privado')"
            }
          },
          listar: {
            metodo: "GET",
            url: "/api/cliente/tarjetas",
            descripcion: "Listar todas las tarjetas del cliente con filtros",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            query: {
              plantillaid: "number (opcional)",
              visibilidad: "string (opcional)",
              busqueda: "string (opcional)",
              orden: "string (opcional, 'creado', 'nombre_tarjeta', 'actualizado')",
              direccion: "string (opcional, 'ASC' o 'DESC')",
              limite: "number (opcional, default 10)",
              pagina: "number (opcional, default 1)"
            }
          },
          obtener: {
            metodo: "GET",
            url: "/api/cliente/tarjetas/:id",
            descripcion: "Obtener una tarjeta específica con su renderizado",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la tarjeta)"
            }
          },
          actualizar: {
            metodo: "PUT",
            url: "/api/cliente/tarjetas/:id",
            descripcion: "Actualizar una tarjeta existente",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la tarjeta)"
            },
            body: {
              plantillaid: "number (opcional)",
              nombre_tarjeta: "string (opcional)",
              datos: "object (opcional)",
              visibilidad: "string (opcional)"
            }
          },
          eliminar: {
            metodo: "DELETE",
            url: "/api/cliente/tarjetas/:id",
            descripcion: "Eliminar una tarjeta (soft delete)",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la tarjeta)"
            }
          }
        }
      },
      tarjetas_publicas: {
        obtener: {
          metodo: "GET",
          url: "/api/tarjetas/publicas/:slug",
          descripcion: "Obtener una tarjeta pública por su slug (incluye contador de visitas)",
          autenticacion: false,
          params: {
            slug: "string (slug único de la tarjeta)"
          },
          notas: [
            "Cada vez que se accede a este endpoint, se incrementa automáticamente el contador de visitas de la tarjeta",
            "El contador de visitas permite medir la popularidad de cada tarjeta pública"
          ]
        }
      },
      plantillas: {
        variables: {
          metodo: "GET",
          url: "/api/variables",
          descripcion: "Obtener todas las variables disponibles para plantillas",
          autenticacion: false,
          query: {
            activo: "boolean (opcional, filtrar por activas)"
          }
        },
        listar: {
          metodo: "GET",
          url: "/api/plantillas",
          descripcion: "Listar todas las plantillas de tarjetas",
          autenticacion: false,
          query: {
            categoriaid: "number (opcional, filtrar por categoría)",
            activo: "boolean (opcional, filtrar por activas)"
          }
        },
        obtener: {
          metodo: "GET",
          url: "/api/plantillas/:id",
          descripcion: "Obtener una plantilla por ID o slug",
          autenticacion: false,
          params: {
            id: "string (ID numérico o slug de la plantilla)"
          }
        },
        crear: {
          metodo: "POST",
          url: "/api/plantillas",
          descripcion: "Crear nueva plantilla de tarjeta (requiere admin/editor)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            nombre: "string (requerido)",
            descripcion: "string (opcional)",
            html_content: "string (requerido, contenido HTML con variables $_nombre_$)",
            css_content: "string (opcional, estilos CSS)",
            preview_image: "string (opcional, URL de imagen de vista previa)",
            categoriaid: "number (opcional, ID de categoría)",
            usa_bootstrap: "boolean (opcional, por defecto true)",
            usa_bootstrap_icons: "boolean (opcional, por defecto false)",
            bootstrap_version: "string (opcional, por defecto '5.3')",
            variables_requeridas: "array (opcional, IDs de variables requeridas)"
          }
        },
        actualizar: {
          metodo: "PUT",
          url: "/api/plantillas/:id",
          descripcion: "Actualizar plantilla existente (requiere admin/editor)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          params: {
            id: "string (ID de la plantilla)"
          },
          body: {
            nombre: "string (opcional)",
            descripcion: "string (opcional)",
            html_content: "string (opcional)",
            css_content: "string (opcional)",
            preview_image: "string (opcional)",
            categoriaid: "number (opcional)",
            usa_bootstrap: "boolean (opcional)",
            usa_bootstrap_icons: "boolean (opcional)",
            bootstrap_version: "string (opcional)",
            activo: "boolean (opcional)",
            variables_requeridas: "array (opcional, IDs de variables requeridas)"
          }
        },
        eliminar: {
          metodo: "DELETE",
          url: "/api/plantillas/:id",
          descripcion: "Eliminar plantilla (soft delete, solo admin)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          params: {
            id: "string (ID de la plantilla)"
          }
        },
        preview: {
          metodo: "POST",
          url: "/api/plantillas/:id/preview",
          descripcion: "Obtener vista previa de plantilla con datos",
          autenticacion: false,
          params: {
            id: "string (ID de la plantilla)"
          },
          body: {
            datos: "object (opcional, valores para las variables)"
          }
        }
      },
      codigos_qr: {
        generar: {
          metodo: "POST",
          url: "/api/qr/generate",
          descripcion: "Generar código QR para cualquier URL",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            url: "string (requerido)",
            format: "string (opcional, 'png', 'base64' o 'svg', default 'base64')",
            size: "number (opcional, tamaño en píxeles, default 300)",
            margin: "number (opcional, margen en píxeles, default 2)",
            errorCorrection: "string (opcional, 'L', 'M', 'Q' o 'H', default 'M')"
          }
        }
      },
      rutas_compartidas: {
        perfil_unificado: {
          metodo: "GET",
          url: "/api/profile",
          descripcion: "Obtener perfil (detecta automáticamente el tipo de usuario)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        logout_unificado: {
          metodo: "POST",
          url: "/api/logout",
          descripcion: "Cerrar sesión (detecta automáticamente el tipo de usuario)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        cambiarPassword_unificado: {
          metodo: "PUT",
          url: "/api/change-password",
          descripcion: "Cambiar contraseña (detecta automáticamente el tipo de usuario)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            password_actual: "string (requerido)",
            password_nuevo: "string (requerido, mínimo 6 caracteres)"
          }
        }
      }
    },
    codigos_respuesta: {
      "200": "Éxito",
      "201": "Recurso creado exitosamente",
      "400": "Error en la petición (datos faltantes o inválidos)",
      "401": "No autorizado (token faltante o inválido)",
      "403": "Prohibido (sin permisos suficientes)",
      "404": "Recurso no encontrado",
      "500": "Error interno del servidor"
    },
    roles: {
      "1": "Admin - Acceso total al sistema",
      "2": "Editor - Puede editar contenido",
      "3": "Visitante - Solo lectura",
      "4": "Cliente - Cliente registrado"
    },
    notas: [
      "Todas las respuestas son en formato JSON",
      "Los tokens JWT expiran en 12 horas",
      "Para rutas protegidas, incluir header: Authorization: Bearer {token}",
      "Las rutas de administración y clientes están separadas para mayor claridad",
      "El email debe ser único en todo el sistema (no puede haber un admin y cliente con el mismo email)",
      "Las plantillas usan variables con formato $_nombre_$ para reemplazar contenido",
      "Las variables se validan automáticamente al crear/actualizar plantillas",
      "Los clientes pueden crear múltiples tarjetas usando diferentes plantillas",
      "Los datos de las tarjetas se guardan en formato JSON, separados de la plantilla",
      "Las tarjetas públicas se pueden compartir mediante un slug único",
      "Cada tarjeta pública tiene un contador de visitas que se incrementa automáticamente",
      "Se pueden generar códigos QR para compartir tarjetas de forma fácil"
    ]
  };

  res.json(endpoints);
});

app.get("/docs", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tarjetas Renova API - Documentación</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1e293b;
              background: #f8fafc;
          }
          .header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: white;
              padding: 3rem 2rem;
              text-align: center;
              border-bottom: 4px solid #3b82f6;
          }
          .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
          .header .version {
              display: inline-block;
              background: #3b82f6;
              padding: 0.25rem 1rem;
              border-radius: 20px;
              font-size: 0.9rem;
              margin-top: 1rem;
          }
          .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
          }
          .info-card {
              background: white;
              border-radius: 12px;
              padding: 1.5rem;
              margin-bottom: 2rem;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              border: 1px solid #e2e8f0;
          }
          .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1rem;
              margin-top: 1rem;
          }
          .info-item {
              background: #f8fafc;
              padding: 1rem;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
          }
          .info-item strong {
              display: block;
              color: #64748b;
              font-size: 0.9rem;
              text-transform: uppercase;
              margin-bottom: 0.5rem;
          }
          .info-item span {
              font-size: 1.1rem;
              color: #0f172a;
              font-family: monospace;
          }
          .section-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #0f172a;
              margin: 2rem 0 1rem 0;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #3b82f6;
          }
          .subsection-title {
              font-size: 1.2rem;
              font-weight: 600;
              color: #334155;
              margin: 1.5rem 0 1rem 0;
              padding-left: 0.5rem;
              border-left: 4px solid #94a3b8;
          }
          .endpoint {
              background: white;
              border-radius: 12px;
              margin-bottom: 1.5rem;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              border: 1px solid #e2e8f0;
              overflow: hidden;
          }
          .endpoint-header {
              display: flex;
              align-items: center;
              padding: 1rem 1.5rem;
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
          }
          .method {
              display: inline-block;
              padding: 0.35rem 1rem;
              border-radius: 6px;
              font-weight: 600;
              font-size: 0.9rem;
              text-transform: uppercase;
              color: white;
              min-width: 70px;
              text-align: center;
          }
          .method.post { background: #2563eb; }
          .method.get { background: #16a34a; }
          .method.put { background: #ca8a04; }
          .method.delete { background: #dc2626; }
          .path {
              font-family: monospace;
              font-size: 1.1rem;
              margin-left: 1rem;
              color: #0f172a;
              font-weight: 500;
          }
          .badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
              margin-left: 1rem;
          }
          .badge.public { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
          .badge.private { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
          .badge.admin { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
          .badge.cliente { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
          .badge.both { background: #e0e7ff; color: #3730a3; border: 1px solid #a5b4fc; }
          .badge.editor { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
          .badge.qr { background: #f3e8ff; color: #6b21a5; border: 1px solid #d8b4fe; }
          .endpoint-content { padding: 1.5rem; }
          .description {
              color: #475569;
              margin-bottom: 1rem;
              font-size: 1rem;
          }
          pre {
              background: #0f172a;
              color: #e2e8f0;
              padding: 1rem;
              border-radius: 8px;
              overflow-x: auto;
              font-family: 'Fira Code', monospace;
              font-size: 0.9rem;
              margin: 0.5rem 0;
              white-space: pre-wrap;
              word-wrap: break-word;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
          }
          th {
              text-align: left;
              padding: 0.75rem;
              background: #f8fafc;
              font-weight: 600;
              color: #475569;
              border-bottom: 2px solid #e2e8f0;
          }
          td {
              padding: 0.75rem;
              border-bottom: 1px solid #e2e8f0;
          }
          .footer {
              background: white;
              border-top: 1px solid #e2e8f0;
              padding: 2rem;
              text-align: center;
              color: #64748b;
          }
          .note {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 1rem;
              border-radius: 6px;
              margin: 1rem 0;
          }
          .note strong {
              color: #92400e;
          }
          .role-table {
              margin: 1rem 0;
          }
          .role-table td:first-child {
              font-family: monospace;
              font-weight: 600;
          }
          .variable-badge {
              display: inline-block;
              background: #e2e8f0;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-family: monospace;
              font-size: 0.9rem;
              margin: 0.25rem;
              color: #0f172a;
          }
          .test-example {
              background: #f0f9ff;
              border-left: 4px solid #0ea5e9;
              padding: 1rem;
              margin: 1rem 0;
              border-radius: 6px;
          }
          .test-example h4 {
              color: #0369a1;
              margin-bottom: 0.5rem;
          }
          .test-example pre {
              background: #1e293b;
              margin: 0.5rem 0;
          }
          .visitas-badge {
              background: #8b5cf6;
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
              margin-left: 1rem;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h1>Tarjetas Renova API</h1>
          <p>Documentación oficial para desarrolladores</p>
          <span class="version">Versión 1.6.0</span>
      </div>
      
      <div class="container">
          <div class="info-card">
              <h2>Información General</h2>
              <div class="info-grid">
                  <div class="info-item"><strong>Base URL</strong><span>${escapeHtml(baseUrl)}/api</span></div>
                  <div class="info-item"><strong>Formato</strong><span>JSON</span></div>
                  <div class="info-item"><strong>Autenticación</strong><span>Bearer Token JWT</span></div>
                  <div class="info-item"><strong>Expiración Token</strong><span>12 horas</span></div>
              </div>
              <div class="note">
                  <strong>Nota importante:</strong> El email debe ser único en todo el sistema. No puede existir un administrador y un cliente con el mismo email.
              </div>
          </div>

          <h2 class="section-title">Administradores</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas para administradores, editores y visitantes (roles 1, 2 y 3).</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registrar un nuevo administrador/editor/visitante.</div>
                  <pre>${escapeHtml(`{
  "nombre": "Juan Pérez",
  "email": "admin@email.com",
  "password": "123456",
  "ip_registro": "127.0.0.1"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/login</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Iniciar sesión como administrador (tipo 'admin' por defecto).</div>
                  <pre>${escapeHtml(`{
  "email": "admin@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1",
  "tipo": "admin"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/forgot-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Solicitar recuperación de contraseña para administradores.</div>
                  <pre>${escapeHtml(`{
  "email": "admin@email.com",
  "tipo": "admin"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/reset-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Restablecer contraseña de administrador con token.</div>
                  <pre>${escapeHtml(`{
  "token": "token_recibido_por_email",
  "new_password": "nueva123",
  "tipo": "admin"
}`)}</pre>
              </div>
          </div>

          <h2 class="section-title">Clientes</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas exclusivas para clientes (rol 4).</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registro completo de clientes con información detallada.</div>
                  <pre>${escapeHtml(`{
  "nombre": "María García",
  "email": "cliente@email.com",
  "password": "123456",
  "telefono": "5551234567",
  "fecha_nacimiento": "1990-01-01",
  "calle": "Av. Principal",
  "numero_exterior": "123",
  "colonia": "Centro",
  "ciudad": "Ciudad de México",
  "estado": "CDMX",
  "codigo_postal": "12345",
  "rfc": "GACM900101XXX",
  "razon_social": "María García Comercial"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/login</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Iniciar sesión como cliente (automáticamente tipo='cliente').</div>
                  <pre>${escapeHtml(`{
  "email": "cliente@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener perfil completo del cliente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/cliente/update-profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar información detallada del cliente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "telefono": "5559876543",
  "calle": "Av. Reforma",
  "numero_exterior": "456"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/logout</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cerrar sesión de cliente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/cliente/change-password</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar contraseña de cliente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/forgot-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Solicitar recuperación de contraseña para clientes.</div>
                  <pre>${escapeHtml(`{
  "email": "cliente@email.com"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/reset-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Restablecer contraseña de cliente con token.</div>
                  <pre>${escapeHtml(`{
  "token": "token_recibido_por_email",
  "new_password": "nueva123"
}`)}</pre>
              </div>
          </div>

          <h2 class="section-title">Tarjetas de Cliente</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Gestión de tarjetas creadas por clientes.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/tarjetas</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Crear una nueva tarjeta para el cliente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "plantillaid": 2,
  "nombre_tarjeta": "Mi tarjeta profesional",
  "visibilidad": "privado",
  "datos": {
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "puesto": "Director de Ventas",
    "empresa": "Mi Empresa S.A.",
    "email": "carlos@miempresa.com",
    "telefono": "+52 55 1234 5678",
    "ciudad": "Ciudad de México"
  }
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/tarjetas</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Listar todas las tarjetas del cliente con filtros.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Query params:
?plantillaid=2
&visibilidad=publico
&busqueda=profesional
&orden=creado
&direccion=DESC
&limite=10
&pagina=1`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/tarjetas/:id</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener una tarjeta específica con su HTML renderizado.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET /api/cliente/tarjetas/5`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/cliente/tarjetas/:id</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar una tarjeta existente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

PUT /api/cliente/tarjetas/5
{
  "nombre_tarjeta": "Nuevo nombre",
  "visibilidad": "publico",
  "datos": {
    "telefono": "+52 55 9999 8888"
  }
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method delete">DELETE</span>
                  <span class="path">/api/cliente/tarjetas/:id</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Eliminar una tarjeta (soft delete).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

DELETE /api/cliente/tarjetas/5`)}</pre>
              </div>
          </div>

          <h2 class="section-title">Tarjetas Públicas</h2>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/tarjetas/publicas/:slug</span>
                  <span class="badge public">Público</span>
                  <span class="visitas-badge">Contador de visitas</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener una tarjeta pública por su slug. Cada vez que se accede a este endpoint, se incrementa automáticamente el contador de visitas de la tarjeta.</div>
                  <div class="test-example">
                      <h4>🔍 Ejemplo de respuesta:</h4>
                      <pre>${escapeHtml(`{
  "tarjetaclienteid": 1,
  "nombre_tarjeta": "Mi Tarjeta Actualizada",
  "plantilla_nombre": "Tarjeta Corporativa Ejecutiva",
  "slug": "mi-tarjeta-actualizada-1",
  "visitas": 5,
  "renderizado": {
    "html": "<div class='tarjeta-ejecutiva'>...",
    "css": ".tarjeta-ejecutiva { ... }",
    "usa_bootstrap": false,
    "usa_bootstrap_icons": false,
    "bootstrap_version": "5.3"
  }
}`)}</pre>
                  </div>
                  <div class="note">
                      <strong>📊 Contador de visitas:</strong> El campo <code>visitas</code> se incrementa automáticamente con cada petición a este endpoint, permitiendo medir la popularidad de cada tarjeta.
                  </div>
              </div>
          </div>

          <h2 class="section-title">Códigos QR</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Genera códigos QR para compartir tus tarjetas digitales fácilmente.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/qr/generate</span>
                  <span class="badge private">Privado</span>
                  <span class="badge qr">QR</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Genera un código QR para cualquier URL (requiere autenticación).</div>
                  <div class="test-example">
                      <h4>📝 Ejemplo de petición:</h4>
                      <pre>${escapeHtml(`POST ${baseUrl}/api/qr/generate
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "url": "https://www.youtube.com/watch?v=MGy9sYnc6w8",
  "format": "base64",
  "size": 300,
  "margin": 2,
  "errorCorrection": "M"
}`)}</pre>
                      <h4>📋 Ejemplo de respuesta:</h4>
                      <pre>${escapeHtml(`{
  "success": true,
  "url": "https://www.youtube.com/watch?v=MGy9sYnc6w8",
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "formato": "base64",
  "opciones": {
    "width": 300,
    "margin": 2,
    "errorCorrectionLevel": "M"
  }
}`)}</pre>
                  </div>
                  <div class="note">
                      <strong>📱 Formatos soportados:</strong> PNG (imagen directa), base64 (texto), SVG (vectorial)
                  </div>
              </div>
          </div>

          <h2 class="section-title">Plantillas de Tarjetas</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Sistema de plantillas con variables dinámicas.</p>
          <div class="note">
              <strong>Formato de variables:</strong> Las variables se definen como <code class="variable-badge">$_nombre_$</code>, <code class="variable-badge">$_apellido_$</code>, <code class="variable-badge">$_email_$</code>, etc. La API valida que todas las variables requeridas estén presentes.
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/variables</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener todas las variables disponibles para usar en plantillas.</div>
                  <div class="test-example">
                      <h4>📋 Ejemplo de respuesta:</h4>
                      <pre>${escapeHtml(`{
  "variables": [
    {
      "variableid": 1,
      "nombre": "nombre",
      "etiqueta": "Nombre",
      "descripcion": "Nombre de la persona",
      "tipo_dato": "texto",
      "ejemplo": "Juan",
      "es_requerida": 1,
      "orden": 1
    },
    {
      "variableid": 2,
      "nombre": "apellido",
      "etiqueta": "Apellido",
      "descripcion": "Apellido de la persona",
      "tipo_dato": "texto",
      "ejemplo": "Pérez",
      "es_requerida": 1,
      "orden": 2
    }
  ]
}`)}</pre>
                  </div>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/plantillas</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Listar todas las plantillas disponibles. Acepta filtros por categoría y estado.</div>
                  <pre>${escapeHtml(`GET ${baseUrl}/api/plantillas?activo=1`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/plantillas/2</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener la plantilla con ID 2.</div>
                  <pre>${escapeHtml(`GET /api/plantillas/2`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/plantillas/tarjeta-corporativa-ejecutiva</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener la misma plantilla usando su slug.</div>
                  <pre>${escapeHtml(`GET ${baseUrl}/api/plantillas/tarjeta-corporativa-ejecutiva`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/plantillas/2/preview</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener vista previa de la plantilla ID 2 con datos de ejemplo.</div>
                  <pre>${escapeHtml(`POST ${baseUrl}/api/plantillas/2/preview
{
  "datos": {
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "email": "carlos@email.com"
  }
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/plantillas</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
                  <span class="badge editor">Editor</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Crear una nueva plantilla (requiere admin o editor).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "nombre": "Nueva Plantilla",
  "html_content": "<div>$_nombre_$</div>",
  "variables_requeridas": [1]
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/plantillas/2</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
                  <span class="badge editor">Editor</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar la plantilla ID 2.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "descripcion": "Nueva descripción"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method delete">DELETE</span>
                  <span class="path">/api/plantillas/2</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Eliminar plantilla ID 2 (soft delete).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

DELETE /api/plantillas/2`)}</pre>
              </div>
          </div>

          <h2 class="section-title">Rutas Compartidas</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Estas rutas funcionan para ambos tipos de usuario y detectan automáticamente el tipo según el token.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener perfil (detecta automáticamente si es admin o cliente por el token).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/logout</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cerrar sesión (detecta automáticamente el tipo de usuario).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/change-password</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar contraseña (detecta automáticamente el tipo de usuario).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}`)}</pre>
              </div>
          </div>

          <div class="info-card">
              <h2>Códigos de Respuesta HTTP</h2>
              <table>
                  <tr><th>Código</th><th>Descripción</th></tr>
                  <tr><td>200</td><td>Éxito</td></tr>
                  <tr><td>201</td><td>Recurso creado exitosamente</td></tr>
                  <tr><td>400</td><td>Error en la petición (datos faltantes o inválidos)</td></tr>
                  <tr><td>401</td><td>No autorizado (token faltante o inválido)</td></tr>
                  <tr><td>403</td><td>Prohibido (sin permisos suficientes)</td></tr>
                  <tr><td>404</td><td>Recurso no encontrado</td></tr>
                  <tr><td>500</td><td>Error interno del servidor</td></tr>
              </table>
          </div>

          <div class="info-card">
              <h2>Variables Disponibles</h2>
              <p style="margin-bottom: 1rem;">Lista de variables predefinidas para usar en plantillas:</p>
              <table class="role-table">
                  <tr><th>Variable</th><th>Etiqueta</th><th>Tipo</th><th>Ejemplo</th></tr>
                  <tr><td>$_nombre_$</td><td>Nombre</td><td>texto</td><td>Juan</td></tr>
                  <tr><td>$_apellido_$</td><td>Apellido</td><td>texto</td><td>Pérez</td></tr>
                  <tr><td>$_nombre_completo_$</td><td>Nombre Completo</td><td>texto</td><td>Juan Pérez</td></tr>
                  <tr><td>$_puesto_$</td><td>Puesto</td><td>texto</td><td>Director Comercial</td></tr>
                  <tr><td>$_empresa_$</td><td>Empresa</td><td>texto</td><td>Tarjetas Renova</td></tr>
                  <tr><td>$_email_$</td><td>Email</td><td>email</td><td>contacto@empresa.com</td></tr>
                  <tr><td>$_telefono_$</td><td>Teléfono</td><td>telefono</td><td>+52 55 1234 5678</td></tr>
                  <tr><td>$_telefono_movil_$</td><td>Teléfono Móvil</td><td>telefono</td><td>+52 55 8765 4321</td></tr>
                  <tr><td>$_direccion_$</td><td>Dirección</td><td>texto</td><td>Av. Reforma #123</td></tr>
                  <tr><td>$_ciudad_$</td><td>Ciudad</td><td>texto</td><td>Ciudad de México</td></tr>
                  <tr><td>$_estado_$</td><td>Estado</td><td>texto</td><td>CDMX</td></tr>
                  <tr><td>$_pais_$</td><td>País</td><td>texto</td><td>México</td></tr>
                  <tr><td>$_codigo_postal_$</td><td>Código Postal</td><td>texto</td><td>06600</td></tr>
                  <tr><td>$_sitio_web_$</td><td>Sitio Web</td><td>texto</td><td>www.empresa.com</td></tr>
                  <tr><td>$_linkedin_$</td><td>LinkedIn</td><td>texto</td><td>linkedin.com/in/usuario</td></tr>
                  <tr><td>$_twitter_$</td><td>Twitter/X</td><td>texto</td><td>@usuario</td></tr>
                  <tr><td>$_instagram_$</td><td>Instagram</td><td>texto</td><td>@usuario</td></tr>
                  <tr><td>$_whatsapp_$</td><td>WhatsApp</td><td>telefono</td><td>+52 55 1234 5678</td></tr>
                  <tr><td>$_qr_url_$</td><td>URL para QR</td><td>texto</td><td>https://tarjetasrenova.com/perfil</td></tr>
              </table>
          </div>

          <div class="info-card">
              <h2>Roles de Usuario</h2>
              <table class="role-table">
                  <tr><th>ID</th><th>Rol</th><th>Descripción</th></tr>
                  <tr><td>1</td><td>Admin</td><td>Acceso total al sistema</td></tr>
                  <tr><td>2</td><td>Editor</td><td>Puede editar contenido pero no gestionar usuarios</td></tr>
                  <tr><td>3</td><td>Visitante</td><td>Solo lectura</td></tr>
                  <tr><td>4</td><td>Cliente</td><td>Cliente registrado en el sistema</td></tr>
              </table>
          </div>

          <div class="info-card">
              <h2>Colección de Postman</h2>
              <p>Puedes importar esta colección en Postman para probar todos los endpoints:</p>
              <pre>${escapeHtml(`{
  "info": {
    "name": "Tarjetas Renova API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Login Admin",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"email\\": \\"admin@email.com\\",\\n  \\"password\\": \\"123456\\",\\n  \\"ip_ultimo_login\\": \\"127.0.0.1\\"\\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": { "raw": "{{baseUrl}}/api/login", "host": ["{{baseUrl}}"], "path": ["api", "login"] }
      }
    },
    {
      "name": "Cliente - Crear Tarjeta",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{tokenCliente}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"plantillaid\\": 2,\\n  \\"nombre_tarjeta\\": \\"Mi tarjeta profesional\\",\\n  \\"visibilidad\\": \\"privado\\",\\n  \\"datos\\": {\\n    \\"nombre\\": \\"Carlos\\",\\n    \\"apellido\\": \\"Rodríguez\\",\\n    \\"puesto\\": \\"Director de Ventas\\",\\n    \\"empresa\\": \\"Mi Empresa S.A.\\",\\n    \\"email\\": \\"carlos@miempresa.com\\",\\n    \\"telefono\\": \\"+52 55 1234 5678\\",\\n    \\"ciudad\\": \\"Ciudad de México\\"\\n  }\\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": { "raw": "{{baseUrl}}/api/cliente/tarjetas", "host": ["{{baseUrl}}"], "path": ["api", "cliente", "tarjetas"] }
      }
    },
    {
      "name": "Cliente - Listar Tarjetas",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{tokenCliente}}"
          }
        ],
        "url": { "raw": "{{baseUrl}}/api/cliente/tarjetas?limite=10&pagina=1", "host": ["{{baseUrl}}"], "path": ["api", "cliente", "tarjetas"], "query": [
          { "key": "limite", "value": "10" },
          { "key": "pagina", "value": "1" }
        ] }
      }
    },
    {
      "name": "Tarjeta Pública",
      "request": {
        "method": "GET",
        "header": [],
        "url": { "raw": "{{baseUrl}}/api/tarjetas/publicas/mi-tarjeta-profesional-5", "host": ["{{baseUrl}}"], "path": ["api", "tarjetas", "publicas", "mi-tarjeta-profesional-5"] }
      }
    },
    {
      "name": "QR - Generar QR",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{tokenAdmin}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"url\\": \\"https://www.youtube.com/watch?v=MGy9sYnc6w8\\",\\n  \\"format\\": \\"base64\\",\\n  \\"size\\": 300\\n}",
          "options": { "raw": { "language": "json" } }
        },
        "url": { "raw": "{{baseUrl}}/api/qr/generate", "host": ["{{baseUrl}}"], "path": ["api", "qr", "generate"] }
      }
    },
    {
      "name": "Plantillas - Obtener ID 2",
      "request": {
        "method": "GET",
        "header": [],
        "url": { "raw": "{{baseUrl}}/api/plantillas/2", "host": ["{{baseUrl}}"], "path": ["api", "plantillas", "2"] }
      }
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "tokenAdmin", "value": "TU_TOKEN_ADMIN_AQUI" },
    { "key": "tokenCliente", "value": "TU_TOKEN_CLIENTE_AQUI" }
  ]
}`)}</pre>
          </div>
      </div>
      
      <div class="footer">
          <p>Tarjetas Renova API v1.6.0 | Documentación para desarrolladores</p>
          <p style="margin-top: 0.5rem;">© 2026 Tarjetas Renova. Todos los derechos reservados.</p>
      </div>
  </body>
  </html>
  `;
  
  res.send(html);
});

app.use("/api", authRoutes);
app.use("/api", plantillaRoutes);
app.use("/api", tarjetaClienteRoutes);
app.use("/api", qrRoutes);
app.use("/api", twoFactorRoutes);
app.use("/api", suscripcionRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: "Consulta la documentación en / o /docs para ver los endpoints disponibles"
  });
});

module.exports = app;