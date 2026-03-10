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
      autenticacion: {
        registro: {
          metodo: "POST",
          url: "/api/register",
          descripcion: "Registrar nuevo usuario",
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
          descripcion: "Iniciar sesión",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            password: "string (requerido)",
            ip_ultimo_login: "string (opcional)"
          }
        },
        perfil: {
          metodo: "GET",
          url: "/api/profile",
          descripcion: "Obtener perfil del usuario",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        logout: {
          metodo: "POST",
          url: "/api/logout",
          descripcion: "Cerrar sesión (invalida el token)",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        cambiarPassword: {
          metodo: "PUT",
          url: "/api/change-password",
          descripcion: "Cambiar contraseña",
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
          descripcion: "Solicitar recuperación de contraseña",
          autenticacion: false,
          body: {
            email: "string (requerido)"
          }
        },
        resetPassword: {
          metodo: "POST",
          url: "/api/reset-password",
          descripcion: "Restablecer contraseña con token",
          autenticacion: false,
          body: {
            token: "string (requerido)",
            new_password: "string (requerido, mínimo 6 caracteres)"
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
    notas: [
      "Todas las respuestas son en formato JSON",
      "Los tokens JWT expiran en 12 horas",
      "Para rutas protegidas, incluir header: Authorization: Bearer {token}"
    ]
  };

  res.json(endpoints);
});

// Ruta de documentación HTML profesional
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
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
          
          .header h1 {
              font-size: 2.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              letter-spacing: -0.5px;
          }
          
          .header p {
              font-size: 1.1rem;
              opacity: 0.9;
              color: #cbd5e1;
          }
          
          .header .version {
              display: inline-block;
              background: #3b82f6;
              color: white;
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
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid #e2e8f0;
          }
          
          .info-card h2 {
              color: #0f172a;
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid #e2e8f0;
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
              letter-spacing: 0.5px;
              margin-bottom: 0.5rem;
          }
          
          .info-item span {
              font-size: 1.1rem;
              color: #0f172a;
              font-family: monospace;
          }
          
          .endpoint {
              background: white;
              border-radius: 12px;
              margin-bottom: 1.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
              letter-spacing: 0.5px;
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
          
          .badge.public {
              background: #dcfce7;
              color: #166534;
              border: 1px solid #86efac;
          }
          
          .badge.private {
              background: #fee2e2;
              color: #991b1b;
              border: 1px solid #fca5a5;
          }
          
          .endpoint-content {
              padding: 1.5rem;
              border-top: 1px solid #e2e8f0;
          }
          
          .description {
              color: #475569;
              margin-bottom: 1.5rem;
              font-size: 1rem;
          }
          
          .section-title {
              font-size: 1rem;
              font-weight: 600;
              color: #0f172a;
              margin: 1rem 0 0.5rem 0;
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
          
          code {
              background: #f1f5f9;
              color: #0f172a;
              padding: 0.2rem 0.4rem;
              border-radius: 4px;
              font-family: monospace;
              font-size: 0.9rem;
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
              color: #334155;
          }
          
          td:first-child {
              font-family: monospace;
              font-weight: 500;
          }
          
          .status-code {
              display: inline-block;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.8rem;
              font-weight: 500;
          }
          
          .status-code.success { background: #dcfce7; color: #166534; }
          .status-code.error { background: #fee2e2; color: #991b1b; }
          .status-code.warning { background: #fef9c3; color: #854d0e; }
          
          .footer {
              background: white;
              border-top: 1px solid #e2e8f0;
              padding: 2rem;
              text-align: center;
              color: #64748b;
              font-size: 0.9rem;
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
                  <div class="info-item">
                      <strong>Base URL</strong>
                      <span>${baseUrl}/api</span>
                  </div>
                  <div class="info-item">
                      <strong>Formato</strong>
                      <span>JSON</span>
                  </div>
                  <div class="info-item">
                      <strong>Autenticación</strong>
                      <span>Bearer Token JWT</span>
                  </div>
                  <div class="info-item">
                      <strong>Expiración Token</strong>
                      <span>12 horas</span>
                  </div>
              </div>
          </div>
          
          <!-- Endpoints de Autenticación -->
          <h2 style="margin: 2rem 0 1rem 0; color: #0f172a;">Endpoints de Autenticación</h2>
          
          <!-- Register -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/register</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registrar un nuevo usuario en el sistema.</div>
                  
                  <div class="section-title">Request Body</div>
                  <pre>{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "password": "123456",
  "ip_registro": "127.0.0.1"  // Opcional
}</pre>
                  
                  <div class="section-title">Validaciones</div>
                  <table>
                      <tr><td>nombre</td><td>Requerido</td></tr>
                      <tr><td>email</td><td>Requerido, formato válido, único</td></tr>
                      <tr><td>password</td><td>Requerido, mínimo 6 caracteres</td></tr>
                  </table>
                  
                  <div class="section-title">Respuesta Exitosa (201)</div>
                  <pre>{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "usuarioid": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "rolid": 3,
    "activo": 1,
    "creado": "2024-01-01T00:00:00"
  }
}</pre>
              </div>
          </div>
          
          <!-- Login -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/login</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Iniciar sesión y obtener token de acceso.</div>
                  
                  <div class="section-title">Request Body</div>
                  <pre>{
  "email": "juan@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1"  // Opcional
}</pre>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "usuarioid": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "activo": 1,
    "creado": "2024-01-01T00:00:00",
    "ultimo_login": "2024-01-01T00:00:00",
    "ip_ultimo_login": "127.0.0.1",
    "rolid": 3
  }
}</pre>
              </div>
          </div>
          
          <!-- Profile -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method get">GET</span>
                  <span class="path">/api/profile</span>
                  <span class="badge private">Privado</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener información del usuario autenticado.</div>
                  
                  <div class="section-title">Headers</div>
                  <pre>Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "usuario": {
    "usuarioid": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "activo": 1,
    "creado": "2024-01-01T00:00:00",
    "ultimo_login": "2024-01-01T00:00:00",
    "ip_ultimo_login": "127.0.0.1",
    "rolid": 3,
    "rol_nombre": "visitante"
  }
}</pre>
              </div>
          </div>
          
          <!-- Logout -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/logout</span>
                  <span class="badge private">Privado</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cerrar sesión e invalidar el token actual.</div>
                  
                  <div class="section-title">Headers</div>
                  <pre>Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "message": "Sesión cerrada exitosamente"
}</pre>
                  
                  <div class="note">
                      <strong>Nota:</strong> Después del logout, el mismo token ya no será válido para ninguna ruta protegida.
                  </div>
              </div>
          </div>
          
          <!-- Change Password -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method put">PUT</span>
                  <span class="path">/api/change-password</span>
                  <span class="badge private">Privado</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar la contraseña del usuario autenticado.</div>
                  
                  <div class="section-title">Headers</div>
                  <pre>Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
                  
                  <div class="section-title">Request Body</div>
                  <pre>{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}</pre>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "message": "Contraseña actualizada exitosamente"
}</pre>
              </div>
          </div>
          
          <!-- Forgot Password -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/forgot-password</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Solicitar recuperación de contraseña.</div>
                  
                  <div class="section-title">Request Body</div>
                  <pre>{
  "email": "juan@email.com"
}</pre>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña"
}</pre>
                  
                  <div class="note">
                      <strong>Nota de seguridad:</strong> Por seguridad, la API siempre devuelve el mismo mensaje, independientemente de si el email existe o no.
                  </div>
              </div>
          </div>
          
          <!-- Reset Password -->
          <div class="endpoint">
              <div class="endpoint-header" onclick="toggleEndpoint(this)">
                  <span class="method post">POST</span>
                  <span class="path">/api/reset-password</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Restablecer contraseña usando token recibido por email.</div>
                  
                  <div class="section-title">Request Body</div>
                  <pre>{
  "token": "token_recibido_por_email",
  "new_password": "nueva123"
}</pre>
                  
                  <div class="section-title">Validaciones</div>
                  <table>
                      <tr><td>new_password</td><td>Mínimo 6 caracteres</td></tr>
                      <tr><td>token</td><td>Válido y no expirado (1 hora de vigencia)</td></tr>
                  </table>
                  
                  <div class="section-title">Respuesta Exitosa (200)</div>
                  <pre>{
  "message": "Contraseña actualizada exitosamente"
}</pre>
              </div>
          </div>
          
          <!-- Códigos de Respuesta -->
          <div class="info-card" style="margin-top: 2rem;">
              <h2>Códigos de Respuesta HTTP</h2>
              <table>
                  <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                  </tr>
                  <tr>
                      <td><span class="status-code success">200</span></td>
                      <td>Éxito</td>
                  </tr>
                  <tr>
                      <td><span class="status-code success">201</span></td>
                      <td>Recurso creado exitosamente</td>
                  </tr>
                  <tr>
                      <td><span class="status-code warning">400</span></td>
                      <td>Error en la petición (datos faltantes o inválidos)</td>
                  </tr>
                  <tr>
                      <td><span class="status-code error">401</span></td>
                      <td>No autorizado (token faltante o inválido)</td>
                  </tr>
                  <tr>
                      <td><span class="status-code error">403</span></td>
                      <td>Prohibido (sin permisos suficientes)</td>
                  </tr>
                  <tr>
                      <td><span class="status-code warning">404</span></td>
                      <td>Recurso no encontrado</td>
                  </tr>
                  <tr>
                      <td><span class="status-code error">500</span></td>
                      <td>Error interno del servidor</td>
                  </tr>
              </table>
          </div>
          
          <!-- Roles -->
          <div class="info-card">
              <h2>Roles de Usuario</h2>
              <table>
                  <tr>
                      <th>ID</th>
                      <th>Rol</th>
                      <th>Descripción</th>
                  </tr>
                  <tr>
                      <td><code>1</code></td>
                      <td>Admin</td>
                      <td>Administrador con todos los permisos</td>
                  </tr>
                  <tr>
                      <td><code>2</code></td>
                      <td>Editor</td>
                      <td>Puede editar contenido pero no gestionar usuarios</td>
                  </tr>
                  <tr>
                      <td><code>3</code></td>
                      <td>Visitante</td>
                      <td>Solo lectura (rol por defecto al registrarse)</td>
                  </tr>
              </table>
          </div>
      </div>
      
      <div class="footer">
          <p>Tarjetas Renova API v1.0.0 | Documentación para desarrolladores</p>
          <p style="margin-top: 0.5rem; font-size: 0.8rem;">© 2024 Tarjetas Renova. Todos los derechos reservados.</p>
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