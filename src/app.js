// src/app.js
const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

// Ruta de inicio - muestra los endpoints disponibles en formato JSON
app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  
  const endpoints = {
    api: "Tarjetas Renova API",
    version: "1.0.0",
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
      "El email debe ser único en todo el sistema (no puede haber un admin y cliente con el mismo email)"
    ]
  };

  res.json(endpoints);
});

// Ruta de documentación HTML
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
              cursor: pointer;
              transition: background 0.2s;
          }
          .endpoint-header:hover {
              background: #f1f5f9;
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
      </style>
  </head>
  <body>
      <div class="header">
          <h1>Tarjetas Renova API</h1>
          <p>Documentación oficial para desarrolladores</p>
          <span class="version">Versión 1.0.0</span>
      </div>
      
      <div class="container">
          <!-- Información General -->
          <div class="info-card">
              <h2>Información General</h2>
              <div class="info-grid">
                  <div class="info-item"><strong>Base URL</strong><span>${baseUrl}/api</span></div>
                  <div class="info-item"><strong>Formato</strong><span>JSON</span></div>
                  <div class="info-item"><strong>Autenticación</strong><span>Bearer Token JWT</span></div>
                  <div class="info-item"><strong>Expiración Token</strong><span>12 horas</span></div>
              </div>
              <div class="note">
                  <strong>Nota importante:</strong> El email debe ser único en todo el sistema. No puede existir un administrador y un cliente con el mismo email.
              </div>
          </div>

          <!-- ADMINISTRADORES -->
          <h2 class="section-title">Administradores</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas para administradores, editores y visitantes (roles 1, 2 y 3).</p>

          <!-- Register Admin -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registrar un nuevo administrador/editor/visitante.</div>
                  <pre>{
  "nombre": "Juan Pérez",
  "email": "admin@email.com",
  "password": "123456",
  "ip_registro": "127.0.0.1"  // Opcional
}</pre>
              </div>
          </div>

          <!-- Login Admin -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/login</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Iniciar sesión como administrador (tipo 'admin' por defecto).</div>
                  <pre>{
  "email": "admin@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1",  // Opcional
  "tipo": "admin"  // Opcional, por defecto 'admin'
}</pre>
              </div>
          </div>

          <!-- Forgot Password Admin -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/forgot-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Solicitar recuperación de contraseña para administradores.</div>
                  <pre>{
  "email": "admin@email.com",
  "tipo": "admin"  // Opcional, por defecto 'admin'
}</pre>
              </div>
          </div>

          <!-- Reset Password Admin -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/reset-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Restablecer contraseña de administrador con token.</div>
                  <pre>{
  "token": "token_recibido_por_email",
  "new_password": "nueva123",
  "tipo": "admin"  // Opcional, por defecto 'admin'
}</pre>
              </div>
          </div>

          <!-- CLIENTES -->
          <h2 class="section-title">Clientes</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas exclusivas para clientes (rol 4).</p>

          <!-- Register Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registro completo de clientes con información detallada.</div>
                  <pre>{
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
}</pre>
              </div>
          </div>

          <!-- Login Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/login</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Iniciar sesión como cliente (automáticamente tipo='cliente').</div>
                  <pre>{
  "email": "cliente@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1"  // Opcional
}</pre>
              </div>
          </div>

          <!-- Profile Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener perfil completo del cliente (incluye información de tabla clientes).</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
              </div>
          </div>

          <!-- Update Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method put">PUT</span>
                  <span class="path">/api/cliente/update-profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar información detallada del cliente.</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "telefono": "5559876543",
  "calle": "Av. Reforma",
  "numero_exterior": "456",
  "colonia": "Juárez",
  "ciudad": "Ciudad de México",
  "rfc": "NUEVORFC123456"
}</pre>
              </div>
          </div>

          <!-- Logout Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/logout</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cerrar sesión de cliente.</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
              </div>
          </div>

          <!-- Change Password Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method put">PUT</span>
                  <span class="path">/api/cliente/change-password</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar contraseña de cliente.</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}</pre>
              </div>
          </div>

          <!-- Forgot Password Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/forgot-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Solicitar recuperación de contraseña para clientes.</div>
                  <pre>{
  "email": "cliente@email.com"
}</pre>
              </div>
          </div>

          <!-- Reset Password Cliente -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/reset-password</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Restablecer contraseña de cliente con token.</div>
                  <pre>{
  "token": "token_recibido_por_email",
  "new_password": "nueva123"
}</pre>
              </div>
          </div>

          <!-- RUTAS COMPARTIDAS -->
          <h2 class="section-title">Rutas Compartidas</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Estas rutas funcionan para ambos tipos de usuario y detectan automáticamente el tipo según el token.</p>

          <!-- Profile Unificado -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method get">GET</span>
                  <span class="path">/api/profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener perfil (detecta automáticamente si es admin o cliente por el token).</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
              </div>
          </div>

          <!-- Logout Unificado -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/logout</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cerrar sesión (detecta automáticamente el tipo de usuario).</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
              </div>
          </div>

          <!-- Change Password Unificado -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method put">PUT</span>
                  <span class="path">/api/change-password</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar contraseña (detecta automáticamente el tipo de usuario).</div>
                  <pre>Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}</pre>
              </div>
          </div>

          <!-- Códigos de Respuesta -->
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

          <!-- Roles -->
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
      </div>
      
      <div class="footer">
          <p>Tarjetas Renova API v1.0.0 | Documentación para desarrolladores</p>
          <p style="margin-top: 0.5rem;">© 2026 Tarjetas Renova. Todos los derechos reservados.</p>
      </div>

      <script>
          function toggleEndpoint(header) {
              const content = header.nextElementSibling;
              content.style.display = content.style.display === 'none' ? 'block' : 'none';
          }
      </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

app.use("/api", authRoutes);

// Middleware para rutas no encontradas
app.use("/:anyPath", (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: "Consulta la documentación en / o /docs para ver los endpoints disponibles"
  });
});

module.exports = app;