const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const plantillaRoutes = require("./routes/plantilla.routes");
const tarjetaClienteRoutes = require("./routes/tarjetaCliente.routes");
const qrRoutes = require("./routes/qr.routes");
const twoFactorRoutes = require("./routes/twoFactor.routes");
const suscripcionRoutes = require("./routes/suscripcion.routes");
const adminRoutes = require("./routes/admin.routes");
const imageRoutes = require("./routes/images.routes");

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
    version: "1.9.2",
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
      suscripciones: {
        tipos: {
          metodo: "GET",
          url: "/api/suscripciones/tipos",
          descripcion: "Obtener todos los tipos de suscripción disponibles",
          autenticacion: false
        },
        miSuscripcion: {
          metodo: "GET",
          url: "/api/cliente/suscripcion/mi-suscripcion",
          descripcion: "Obtener la suscripción activa del cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        crear: {
          metodo: "POST",
          url: "/api/cliente/suscripcion/crear",
          descripcion: "Crear una nueva suscripción para el cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          body: {
            tiposuscripcionid: "number (requerido)",
            metodo_pago: "string (opcional)",
            renovar_automatico: "boolean (opcional)"
          }
        },
        cancelar: {
          metodo: "POST",
          url: "/api/cliente/suscripcion/cancelar",
          descripcion: "Cancelar la suscripción activa del cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        historial: {
          metodo: "GET",
          url: "/api/cliente/suscripcion/historial",
          descripcion: "Obtener el historial de suscripciones del cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          },
          query: {
            limite: "number (opcional, default 20)",
            pagina: "number (opcional, default 1)"
          }
        },
        dashboard: {
          metodo: "GET",
          url: "/api/cliente/dashboard",
          descripcion: "Obtener estadísticas del dashboard del cliente",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        }
      },
      administracion: {
        usuarios: {
          listar: {
            metodo: "GET",
            url: "/api/admin/usuarios",
            descripcion: "Listar todos los usuarios (admins y clientes)",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            query: {
              tipo: "string (opcional, 'admin' o 'cliente')",
              busqueda: "string (opcional)",
              activo: "boolean (opcional)"
            }
          },
          obtener: {
            metodo: "GET",
            url: "/api/admin/usuarios/:id",
            descripcion: "Obtener un usuario específico por ID",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID del usuario)"
            },
            query: {
              tipo: "string (opcional, 'admin' o 'cliente')"
            }
          },
          actualizarRol: {
            metodo: "PUT",
            url: "/api/admin/usuarios/:id/rol",
            descripcion: "Actualizar el rol de un usuario",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID del usuario)"
            },
            body: {
              rolid: "number (requerido)",
              tipo: "string (opcional, 'admin' o 'cliente')"
            }
          },
          actualizarEstado: {
            metodo: "PUT",
            url: "/api/admin/usuarios/:id/estado",
            descripcion: "Activar o desactivar un usuario",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID del usuario)"
            },
            body: {
              activo: "boolean (requerido)",
              tipo: "string (opcional, 'admin' o 'cliente')"
            }
          },
          eliminar: {
            metodo: "DELETE",
            url: "/api/admin/usuarios/:id",
            descripcion: "Eliminar un usuario (soft delete)",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID del usuario)"
            },
            body: {
              tipo: "string (opcional, 'admin' o 'cliente')"
            }
          }
        },
        dashboard: {
          stats: {
            metodo: "GET",
            url: "/api/admin/dashboard/stats",
            descripcion: "Obtener estadísticas globales del sistema",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          }
        },
        estadisticas: {
          visitas: {
            metodo: "GET",
            url: "/api/admin/estadisticas/visitas",
            descripcion: "Obtener estadísticas de visitas",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            query: {
              periodo: "string (opcional, '7dias', '30dias', '90dias')"
            }
          },
          tarjetas: {
            metodo: "GET",
            url: "/api/admin/estadisticas/tarjetas",
            descripcion: "Obtener estadísticas de tarjetas",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          }
        },
        variables: {
          listar: {
            metodo: "GET",
            url: "/api/admin/variables",
            descripcion: "Obtener todas las variables de plantilla",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          },
          crear: {
            metodo: "POST",
            url: "/api/admin/variables",
            descripcion: "Crear una nueva variable de plantilla",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            body: {
              nombre: "string (requerido)",
              etiqueta: "string (requerido)",
              descripcion: "string (opcional)",
              tipo_dato: "string (opcional, 'texto', 'email', 'telefono', 'url', 'fecha')",
              ejemplo: "string (opcional)",
              es_requerida: "boolean (opcional)",
              orden: "number (opcional)"
            }
          },
          actualizar: {
            metodo: "PUT",
            url: "/api/admin/variables/:id",
            descripcion: "Actualizar una variable de plantilla",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la variable)"
            },
            body: {
              nombre: "string (opcional)",
              etiqueta: "string (opcional)",
              descripcion: "string (opcional)",
              tipo_dato: "string (opcional)",
              ejemplo: "string (opcional)",
              es_requerida: "boolean (opcional)",
              orden: "number (opcional)",
              activo: "boolean (opcional)"
            }
          },
          eliminar: {
            metodo: "DELETE",
            url: "/api/admin/variables/:id",
            descripcion: "Eliminar una variable de plantilla",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la variable)"
            }
          }
        },
        categorias: {
          listar: {
            metodo: "GET",
            url: "/api/admin/categorias",
            descripcion: "Obtener todas las categorías",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          },
          crear: {
            metodo: "POST",
            url: "/api/admin/categorias",
            descripcion: "Crear una nueva categoría",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            body: {
              nombre: "string (requerido)",
              descripcion: "string (opcional)",
              orden: "number (opcional)",
              activo: "boolean (opcional)"
            }
          },
          actualizar: {
            metodo: "PUT",
            url: "/api/admin/categorias/:id",
            descripcion: "Actualizar una categoría",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la categoría)"
            },
            body: {
              nombre: "string (opcional)",
              descripcion: "string (opcional)",
              orden: "number (opcional)",
              activo: "boolean (opcional)"
            }
          },
          eliminar: {
            metodo: "DELETE",
            url: "/api/admin/categorias/:id",
            descripcion: "Eliminar una categoría",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID de la categoría)"
            }
          }
        },
        logs: {
          listar: {
            metodo: "GET",
            url: "/api/admin/logs",
            descripcion: "Obtener los logs de auditoría",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            query: {
              limite: "number (opcional, default 50)",
              pagina: "number (opcional, default 1)",
              accion: "string (opcional)",
              admin_id: "number (opcional)"
            }
          },
          porUsuario: {
            metodo: "GET",
            url: "/api/admin/logs/usuario/:id",
            descripcion: "Obtener logs de un usuario específico",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              id: "number (ID del usuario)"
            },
            query: {
              limite: "number (opcional, default 50)"
            }
          }
        },
        suscripciones: {
          listar: {
            metodo: "GET",
            url: "/api/admin/suscripciones",
            descripcion: "Obtener todas las suscripciones",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          },
          crear: {
            metodo: "POST",
            url: "/api/admin/suscripciones/crear",
            descripcion: "Crear una suscripción para un cliente (admin)",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            body: {
              usuarioid: "number (requerido)",
              tiposuscripcionid: "number (requerido)",
              dias: "number (opcional)",
              renovar_automatico: "boolean (opcional)"
            }
          },
          renovar: {
            metodo: "POST",
            url: "/api/admin/suscripciones/:suscripcionid/renovar",
            descripcion: "Renovar una suscripción existente",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              suscripcionid: "number (ID de la suscripción)"
            },
            body: {
              dias_extra: "number (opcional)"
            }
          },
          notificarVencimiento: {
            metodo: "POST",
            url: "/api/admin/suscripciones/:suscripcionid/notificar-vencimiento",
            descripcion: "Enviar notificación de vencimiento",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            },
            params: {
              suscripcionid: "number (ID de la suscripción)"
            }
          },
          verificarVencimientos: {
            metodo: "POST",
            url: "/api/admin/suscripciones/verificar-vencimientos",
            descripcion: "Verificar y notificar suscripciones por vencer",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          },
          clientes: {
            metodo: "GET",
            url: "/api/admin/clientes",
            descripcion: "Obtener lista de clientes",
            autenticacion: true,
            headers: {
              Authorization: "Bearer {token}"
            }
          }
        }
      },
      dosFactores: {
        enviarCodigo: {
          metodo: "POST",
          url: "/api/2fa/send-code",
          descripcion: "Enviar código de verificación 2FA",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            tipo: "string (opcional, 'admin' o 'cliente')"
          }
        },
        verificar: {
          metodo: "POST",
          url: "/api/2fa/verify",
          descripcion: "Verificar código 2FA",
          autenticacion: false,
          body: {
            email: "string (requerido)",
            codigo: "string (requerido)",
            tipo: "string (opcional)",
            backup_code: "boolean (opcional)"
          }
        },
        activar: {
          metodo: "POST",
          url: "/api/2fa/enable",
          descripcion: "Activar 2FA para el usuario autenticado",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        desactivar: {
          metodo: "POST",
          url: "/api/2fa/disable",
          descripcion: "Desactivar 2FA para el usuario autenticado",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        estado: {
          metodo: "GET",
          url: "/api/2fa/status",
          descripcion: "Obtener estado de 2FA",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
          }
        },
        regenerarCodigos: {
          metodo: "POST",
          url: "/api/2fa/regenerate-backup-codes",
          descripcion: "Regenerar códigos de respaldo 2FA",
          autenticacion: true,
          headers: {
            Authorization: "Bearer {token}"
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
      },
      imagenes: {
        obtener: {
          metodo: "GET",
          url: "/images/:filename",
          descripcion: "Obtener una imagen del servidor",
          autenticacion: false,
          params: {
            filename: "string (nombre del archivo de imagen)"
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
      "Se pueden generar códigos QR para compartir tarjetas de forma fácil",
      "El sistema de suscripciones permite limitar el número de tarjetas por cliente",
      "2FA (doble factor de autenticación) está disponible para mayor seguridad",
      "Los logs de auditoría registran todas las acciones importantes del sistema"
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
              flex-wrap: wrap;
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
              word-break: break-all;
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
          .badge.suscripcion { background: #fce7f3; color: #9d174d; border: 1px solid #f9a8d4; }
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
          .success-note {
              background: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 1rem;
              border-radius: 6px;
              margin: 1rem 0;
          }
          .warning-note {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 1rem;
              border-radius: 6px;
              margin: 1rem 0;
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
          .search-box {
              margin-bottom: 2rem;
              padding: 1rem;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .search-box input {
              width: 100%;
              padding: 0.75rem;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              font-size: 1rem;
              transition: border-color 0.3s;
          }
          .search-box input:focus {
              outline: none;
              border-color: #3b82f6;
          }
          .toc {
              background: white;
              border-radius: 12px;
              padding: 1rem;
              margin-bottom: 2rem;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .toc h3 {
              margin-bottom: 0.5rem;
              color: #0f172a;
          }
          .toc ul {
              list-style: none;
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
          }
          .toc li {
              display: inline;
          }
          .toc a {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              background: #f1f5f9;
              border-radius: 20px;
              text-decoration: none;
              color: #475569;
              font-size: 0.9rem;
              transition: all 0.3s;
          }
          .toc a:hover {
              background: #3b82f6;
              color: white;
          }
          @media (max-width: 768px) {
              .container { padding: 1rem; }
              .endpoint-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
              .path { margin-left: 0; }
              .badge { margin-left: 0; margin-right: 0.5rem; }
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h1>📇 Tarjetas Renova API</h1>
          <p>Documentación oficial para desarrolladores</p>
          <span class="version">Versión 1.9.2</span>
      </div>
      
      <div class="container">
          <div class="search-box">
              <input type="text" id="searchInput" placeholder="🔍 Buscar endpoints, descripciones o parámetros...">
          </div>
          
          <div class="toc">
              <h3>📑 Índice Rápido</h3>
              <ul>
                  <li><a href="#info-general">Información General</a></li>
                  <li><a href="#administradores">Administradores</a></li>
                  <li><a href="#clientes">Clientes</a></li>
                  <li><a href="#tarjetas">Tarjetas</a></li>
                  <li><a href="#tarjetas-publicas">Tarjetas Públicas</a></li>
                  <li><a href="#suscripciones">Suscripciones</a></li>
                  <li><a href="#administracion">Administración</a></li>
                  <li><a href="#2fa">2FA</a></li>
                  <li><a href="#qr">Códigos QR</a></li>
                  <li><a href="#plantillas">Plantillas</a></li>
                  <li><a href="#variables">Variables</a></li>
                  <li><a href="#categorias">Categorías</a></li>
                  <li><a href="#logs">Logs</a></li>
                  <li><a href="#respuestas">Códigos de Respuesta</a></li>
                  <li><a href="#roles">Roles</a></li>
                  <li><a href="#postman">Postman</a></li>
              </ul>
          </div>

          <div id="info-general" class="info-card">
              <h2>📋 Información General</h2>
              <div class="info-grid">
                  <div class="info-item"><strong>Base URL</strong><span>${escapeHtml(baseUrl)}/api</span></div>
                  <div class="info-item"><strong>Formato</strong><span>JSON</span></div>
                  <div class="info-item"><strong>Autenticación</strong><span>Bearer Token JWT</span></div>
                  <div class="info-item"><strong>Expiración Token</strong><span>12 horas</span></div>
              </div>
              <div class="note">
                  <strong>📧 Nota importante:</strong> El email debe ser único en todo el sistema. No puede existir un administrador y un cliente con el mismo email.
              </div>
              <div class="success-note">
                  <strong>✅ Seguridad:</strong> Todos los endpoints protegidos requieren el header: <code>Authorization: Bearer {token}</code>
              </div>
          </div>

          <h2 id="administradores" class="section-title">👑 Administradores</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas para administradores, editores y visitantes (roles 1, 2 y 3).</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registrar un nuevo administrador/editor/visitante. El rol por defecto es 3 (Visitante).</div>
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
                  <div class="description">Iniciar sesión como administrador. Si el usuario tiene 2FA activado, se requerirá un código de verificación.</div>
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
                  <span class="method get">GET</span>
                  <span class="path">/api/profile</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener perfil del usuario autenticado (detecta automáticamente si es admin o cliente).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`)}</pre>
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
                  <div class="description">Solicitar recuperación de contraseña para administradores. Se enviará un email con un token de recuperación.</div>
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
                  <div class="description">Restablecer contraseña de administrador con el token recibido por email.</div>
                  <pre>${escapeHtml(`{
  "token": "token_recibido_por_email",
  "new_password": "nueva123",
  "tipo": "admin"
}`)}</pre>
              </div>
          </div>

          <h2 id="clientes" class="section-title">👤 Clientes</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas exclusivas para clientes (rol 4). Los clientes pueden crear y gestionar sus tarjetas digitales.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/register</span>
                  <span class="badge public">Público</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Registro completo de clientes con información detallada (datos personales, dirección, facturación).</div>
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
                  <div class="description">Iniciar sesión como cliente. Valida automáticamente si la suscripción está activa.</div>
                  <pre>${escapeHtml(`{
  "email": "cliente@email.com",
  "password": "123456",
  "ip_ultimo_login": "127.0.0.1"
}`)}</pre>
                  <div class="warning-note">
                      <strong>⚠️ Nota:</strong> Si la suscripción del cliente ha vencido, el login será denegado con un mensaje indicando que debe renovar.
                  </div>
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
                  <div class="description">Obtener perfil completo del cliente (incluye información personal, dirección y datos fiscales).</div>
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
                  <div class="description">Actualizar información detallada del cliente (datos de contacto, dirección, facturación).</div>
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
                  <span class="method put">PUT</span>
                  <span class="path">/api/change-password</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cambiar contraseña del usuario autenticado (funciona para admin y cliente).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "password_actual": "123456",
  "password_nuevo": "nueva123"
}`)}</pre>
              </div>
          </div>

          <h2 id="tarjetas" class="section-title">🃏 Tarjetas de Cliente</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Gestión completa de tarjetas digitales creadas por clientes.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/tarjetas</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Crear una nueva tarjeta digital. Valida automáticamente los límites de la suscripción y las variables requeridas.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "plantillaid": 2,
  "nombre_tarjeta": "Mi tarjeta profesional",
  "visibilidad": "publico",
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
                  <div class="description">Listar todas las tarjetas del cliente con soporte para filtros, paginación y ordenamiento.</div>
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
                  <div class="test-example">
                      <h4>📋 Parámetros de consulta disponibles:</h4>
                      <ul>
                          <li><code>plantillaid</code> - Filtrar por ID de plantilla</li>
                          <li><code>visibilidad</code> - 'publico' o 'privado'</li>
                          <li><code>busqueda</code> - Buscar en nombre_tarjeta y datos</li>
                          <li><code>orden</code> - 'creado', 'nombre_tarjeta', 'actualizado'</li>
                          <li><code>direccion</code> - 'ASC' o 'DESC'</li>
                          <li><code>limite</code> - Número de resultados por página (default: 10)</li>
                          <li><code>pagina</code> - Número de página (default: 1)</li>
                      </ul>
                  </div>
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
                  <div class="description">Obtener una tarjeta específica con su HTML renderizado y estilos CSS.</div>
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
                  <div class="description">Actualizar una tarjeta existente (nombre, visibilidad, datos).</div>
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
                  <div class="description">Eliminar una tarjeta (soft delete - se marca como inactiva).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

DELETE /api/cliente/tarjetas/5`)}</pre>
              </div>
          </div>

          <h2 id="tarjetas-publicas" class="section-title">🌍 Tarjetas Públicas</h2>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/tarjetas/publicas/:slug</span>
                  <span class="badge public">Público</span>
                  <span class="visitas-badge">📊 Contador de visitas</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener una tarjeta pública por su slug. Cada vez que se accede a este endpoint, se incrementa automáticamente el contador de visitas de la tarjeta. Es ideal para compartir en perfiles, websites o códigos QR.</div>
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
                  <div class="success-note">
                      <strong>📊 Contador de visitas:</strong> El campo <code>visitas</code> se incrementa automáticamente con cada petición a este endpoint, permitiendo medir la popularidad de cada tarjeta. Ideal para campañas de marketing y seguimiento de leads.
                  </div>
              </div>
          </div>

          <h2 id="suscripciones" class="section-title">💰 Suscripciones</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Gestión de planes de suscripción para clientes.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/suscripciones/tipos</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener todos los tipos de suscripción disponibles (planes: Básico, Profesional, Empresarial, etc.).</div>
                  <pre>${escapeHtml(`GET ${baseUrl}/api/suscripciones/tipos`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/suscripcion/mi-suscripcion</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener la suscripción activa del cliente (plan, fechas, días restantes).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/cliente/suscripcion/mi-suscripcion`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/suscripcion/crear</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Crear una nueva suscripción para el cliente. Automáticamente cancela cualquier suscripción activa previa.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "tiposuscripcionid": 2,
  "metodo_pago": "tarjeta",
  "renovar_automatico": true
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/cliente/suscripcion/cancelar</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Cancelar la suscripción activa del cliente. La suscripción se marcará como 'cancelada' y no se renovará automáticamente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

POST ${baseUrl}/api/cliente/suscripcion/cancelar`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/suscripcion/historial</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener el historial completo de suscripciones del cliente (activas, vencidas, canceladas).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/cliente/suscripcion/historial?limite=20&pagina=1`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/cliente/dashboard</span>
                  <span class="badge private">Privado</span>
                  <span class="badge cliente">Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener estadísticas del dashboard del cliente: tarjetas creadas, visitas, límites restantes, actividad reciente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/cliente/dashboard`)}</pre>
              </div>
          </div>

          <h2 id="administracion" class="section-title">🔧 Administración</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Rutas exclusivas para administradores (rol 1).</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/usuarios</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Listar todos los usuarios del sistema (admins y clientes). Soporta filtros por tipo, búsqueda y estado.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/usuarios?tipo=cliente&activo=1&busqueda=juan`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/admin/usuarios/:id/rol</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar el rol de un usuario. No se puede cambiar el propio rol del admin autenticado.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

PUT /api/admin/usuarios/5/rol
{
  "rolid": 2,
  "tipo": "admin"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/admin/usuarios/:id/estado</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Activar o desactivar un usuario. Los usuarios desactivados no pueden iniciar sesión.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

PUT /api/admin/usuarios/5/estado
{
  "activo": 0,
  "tipo": "cliente"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/dashboard/stats</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener estadísticas globales del sistema: usuarios, plantillas, tarjetas, visitas, suscripciones activas, tarjetas populares, actividad reciente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/dashboard/stats`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/estadisticas/visitas</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener estadísticas de visitas. Permite filtrar por período (7 días, 30 días, 90 días).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/estadisticas/visitas?periodo=30dias`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/logs</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener los logs de auditoría del sistema con paginación y filtros.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/logs?limite=50&pagina=1&accion=crear_variable`)}</pre>
              </div>
          </div>

          <h2 id="2fa" class="section-title">🔐 Doble Factor de Autenticación (2FA)</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Sistema de verificación en dos pasos para mayor seguridad.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/2fa/enable</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Activar 2FA para el usuario autenticado. Genera códigos de respaldo y los envía por email.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

POST ${baseUrl}/api/2fa/enable`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/2fa/disable</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Desactivar 2FA para el usuario autenticado.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

POST ${baseUrl}/api/2fa/disable`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/2fa/send-code</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Enviar código de verificación 2FA por email al usuario.</div>
                  <pre>${escapeHtml(`{
  "email": "usuario@email.com",
  "tipo": "cliente"
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/2fa/verify</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Verificar código 2FA. Soporta tanto códigos numéricos como códigos de respaldo.</div>
                  <pre>${escapeHtml(`{
  "email": "usuario@email.com",
  "codigo": "123456",
  "tipo": "cliente",
  "backup_code": false
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/2fa/status</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener el estado de 2FA del usuario autenticado.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/2fa/status`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/2fa/regenerate-backup-codes</span>
                  <span class="badge private">Privado</span>
                  <span class="badge both">Admin/Cliente</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Regenerar códigos de respaldo 2FA. Los códigos anteriores se invalidan automáticamente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

POST ${baseUrl}/api/2fa/regenerate-backup-codes`)}</pre>
              </div>
          </div>

          <h2 id="qr" class="section-title">📱 Códigos QR</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Genera códigos QR para compartir tus tarjetas digitales fácilmente.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/qr/generate</span>
                  <span class="badge private">Privado</span>
                  <span class="badge qr">QR</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Genera un código QR para cualquier URL. Soporta múltiples formatos y opciones de personalización.</div>
                  <div class="test-example">
                      <h4>📝 Ejemplo de petición:</h4>
                      <pre>${escapeHtml(`POST ${baseUrl}/api/qr/generate
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "url": "https://tarjetasrenova.com/tarjeta/mi-tarjeta",
  "format": "base64",
  "size": 300,
  "margin": 2,
  "errorCorrection": "M"
}`)}</pre>
                      <h4>📋 Ejemplo de respuesta:</h4>
                      <pre>${escapeHtml(`{
  "success": true,
  "url": "https://tarjetasrenova.com/tarjeta/mi-tarjeta",
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "formato": "base64",
  "opciones": {
    "width": 300,
    "margin": 2,
    "errorCorrectionLevel": "M"
  }
}`)}</pre>
                  </div>
                  <div class="success-note">
                      <strong>📱 Formatos soportados:</strong>
                      <ul>
                          <li><code>base64</code> - Devuelve el QR como string base64 (útil para incrustar en HTML)</li>
                          <li><code>png</code> - Devuelve la imagen PNG directamente</li>
                          <li><code>svg</code> - Devuelve el QR como SVG vectorial</li>
                      </ul>
                  </div>
              </div>
          </div>

          <h2 id="plantillas" class="section-title">🎨 Plantillas de Tarjetas</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Sistema de plantillas con variables dinámicas para personalización completa.</p>
          
          <div class="note">
              <strong>📝 Formato de variables:</strong> Las variables se definen como <code class="variable-badge">$_nombre_$</code>, <code class="variable-badge">$_apellido_$</code>, <code class="variable-badge">$_email_$</code>, etc. La API valida automáticamente que todas las variables requeridas estén presentes en el contenido HTML de la plantilla.
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
      "orden": 1,
      "activo": 1
    },
    {
      "variableid": 2,
      "nombre": "empresa",
      "etiqueta": "Empresa",
      "descripcion": "Nombre de la empresa",
      "tipo_dato": "texto",
      "ejemplo": "Mi Empresa S.A.",
      "es_requerida": 1,
      "orden": 2,
      "activo": 1
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
                  <pre>${escapeHtml(`GET ${baseUrl}/api/plantillas?categoriaid=1&activo=1`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/plantillas/:id</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener una plantilla por ID o slug. Incrementa automáticamente el contador de visitas de la plantilla.</div>
                  <pre>${escapeHtml(`GET ${baseUrl}/api/plantillas/2
GET ${baseUrl}/api/plantillas/tarjeta-corporativa-ejecutiva`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/plantillas/:id/preview</span>
                  <span class="badge public">Público</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener vista previa de la plantilla con datos de ejemplo. Útil para probar plantillas antes de usarlas.</div>
                  <pre>${escapeHtml(`POST ${baseUrl}/api/plantillas/2/preview
{
  "datos": {
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "email": "carlos@email.com",
    "empresa": "Mi Empresa"
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
                  <div class="description">Crear una nueva plantilla. Requiere autenticación con rol de admin o editor.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "nombre": "Nueva Plantilla",
  "descripcion": "Descripción de la plantilla",
  "html_content": "<div class='tarjeta'><h1>$_nombre_$</h1><p>$_empresa_$</p></div>",
  "css_content": ".tarjeta { font-family: Arial; }",
  "categoriaid": 1,
  "usa_bootstrap": true,
  "variables_requeridas": [1, 2]
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method put">PUT</span>
                  <span class="path">/api/plantillas/:id</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
                  <span class="badge editor">Editor</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Actualizar una plantilla existente.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "descripcion": "Nueva descripción actualizada",
  "activo": 1
}`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method delete">DELETE</span>
                  <span class="path">/api/plantillas/:id</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Eliminar una plantilla (soft delete - solo administradores).</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

DELETE /api/plantillas/2`)}</pre>
              </div>
          </div>

          <h2 id="variables" class="section-title">🔤 Variables Disponibles</h2>
          <div class="info-card">
              <p style="margin-bottom: 1rem;">Lista completa de variables predefinidas para usar en plantillas:</p>
              <table class="role-table">
                  <thead>
                      <tr><th>Variable</th><th>Etiqueta</th><th>Tipo</th><th>Ejemplo</th></tr>
                  </thead>
                  <tbody>
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
                      <tr><td>$_sitio_web_$</td><td>Sitio Web</td><td>url</td><td>www.empresa.com</td></tr>
                      <tr><td>$_linkedin_$</td><td>LinkedIn</td><td>url</td><td>linkedin.com/in/usuario</td></tr>
                      <tr><td>$_twitter_$</td><td>Twitter/X</td><td>texto</td><td>@usuario</td></tr>
                      <tr><td>$_instagram_$</td><td>Instagram</td><td>texto</td><td>@usuario</td></tr>
                      <tr><td>$_whatsapp_$</td><td>WhatsApp</td><td>telefono</td><td>+52 55 1234 5678</td></tr>
                      <tr><td>$_qr_url_$</td><td>URL para QR</td><td>url</td><td>https://tarjetasrenova.com/perfil</td></tr>
                  </tbody>
              </table>
          </div>

          <h2 id="categorias" class="section-title">📂 Categorías</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Gestión de categorías para organizar las plantillas de tarjetas.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/categorias</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener todas las categorías con el conteo de plantillas asociadas.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/categorias`)}</pre>
              </div>
          </div>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method post">POST</span>
                  <span class="path">/api/admin/categorias</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Crear una nueva categoría.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "nombre": "Corporativas",
  "descripcion": "Plantillas para empresas",
  "orden": 1,
  "activo": 1
}`)}</pre>
              </div>
          </div>

          <h2 id="logs" class="section-title">📝 Logs de Auditoría</h2>
          <p style="margin-bottom: 1rem; color: #475569;">Seguimiento completo de todas las acciones importantes en el sistema.</p>

          <div class="endpoint">
              <div class="endpoint-header">
                  <span class="method get">GET</span>
                  <span class="path">/api/admin/logs</span>
                  <span class="badge private">Privado</span>
                  <span class="badge admin">Admin</span>
              </div>
              <div class="endpoint-content">
                  <div class="description">Obtener logs de auditoría con paginación y filtros por acción y administrador.</div>
                  <pre>${escapeHtml(`Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET ${baseUrl}/api/admin/logs?limite=50&pagina=1&accion=crear_variable&admin_id=1`)}</pre>
                  <div class="test-example">
                      <h4>📋 Acciones registradas:</h4>
                      <ul>
                          <li><code>cambio_rol</code> - Cambio de rol de usuario</li>
                          <li><code>activar_usuario</code> / <code>desactivar_usuario</code> - Cambio de estado</li>
                          <li><code>eliminar_usuario</code> - Soft delete de usuario</li>
                          <li><code>crear_variable</code> / <code>actualizar_variable</code> / <code>eliminar_variable</code></li>
                          <li><code>crear_categoria</code> - Creación de categoría</li>
                      </ul>
                  </div>
              </div>
          </div>

          <h2 id="respuestas" class="section-title">📊 Códigos de Respuesta HTTP</h2>
          <div class="info-card">
              <table>
                  <thead><tr><th>Código</th><th>Descripción</th></tr></thead>
                  <tbody>
                      <tr><td>200</td><td>✅ Éxito - La operación se completó correctamente</td></tr>
                      <tr><td>201</td><td>✅ Recurso creado exitosamente</td></tr>
                      <tr><td>400</td><td>❌ Error en la petición - Datos faltantes o inválidos</td></tr>
                      <tr><td>401</td><td>🔒 No autorizado - Token faltante o inválido</td></tr>
                      <tr><td>403</td><td>🚫 Prohibido - Sin permisos suficientes</td></tr>
                      <tr><td>404</td><td>🔍 Recurso no encontrado</td></tr>
                      <tr><td>409</td><td>⚠️ Conflicto - Recurso ya existe (ej: email duplicado)</td></tr>
                      <tr><td>422</td><td>📝 Entidad no procesable - Validación fallida</td></tr>
                      <tr><td>429</td><td>⏰ Demasiadas solicitudes - Rate limiting</td></tr>
                      <tr><td>500</td><td>💥 Error interno del servidor</td></tr>
                  </tbody>
              </table>
          </div>

          <h2 id="roles" class="section-title">👥 Roles de Usuario</h2>
          <div class="info-card">
              <table class="role-table">
                  <thead><tr><th>ID</th><th>Rol</th><th>Descripción</th><th>Permisos</th></tr></thead>
                  <tbody>
                      <tr><td>1</td><td>Admin</td><td>Administrador del sistema</td><td>Acceso total a todas las rutas de administración</td></tr>
                      <tr><td>2</td><td>Editor</td><td>Editor de contenido</td><td>Puede crear/editar plantillas y categorías</td></tr>
                      <tr><td>3</td><td>Visitante</td><td>Usuario de solo lectura</td><td>Acceso limitado a visualización</td></tr>
                      <tr><td>4</td><td>Cliente</td><td>Cliente registrado</td><td>Gestión de sus tarjetas y suscripciones</td></tr>
                  </tbody>
              </table>
          </div>

          <div id="postman" class="info-card">
              <h2>📮 Colección de Postman</h2>
              <p>Puedes importar esta colección en Postman para probar todos los endpoints fácilmente:</p>
              <pre>${escapeHtml(`{
  "info": {
    "name": "Tarjetas Renova API",
    "description": "API completa para gestión de tarjetas digitales con QR, suscripciones y 2FA",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "tokenAdmin", "value": "" },
    { "key": "tokenCliente", "value": "" }
  ],
  "item": [
    {
      "name": "1. Autenticación",
      "item": [
        {
          "name": "Login Admin",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/login",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"email\\": \\"admin@email.com\\",\\n  \\"password\\": \\"123456\\"\\n}"
            }
          }
        },
        {
          "name": "Login Cliente",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/cliente/login",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"email\\": \\"cliente@email.com\\",\\n  \\"password\\": \\"123456\\"\\n}"
            }
          }
        },
        {
          "name": "Registro Cliente",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/cliente/register",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"nombre\\": \\"Cliente Nuevo\\",\\n  \\"email\\": \\"nuevo@email.com\\",\\n  \\"password\\": \\"123456\\",\\n  \\"telefono\\": \\"5551234567\\"\\n}"
            }
          }
        }
      ]
    },
    {
      "name": "2. Tarjetas",
      "item": [
        {
          "name": "Crear Tarjeta",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/cliente/tarjetas",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{tokenCliente}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"plantillaid\\": 1,\\n  \\"nombre_tarjeta\\": \\"Mi Tarjeta\\",\\n  \\"visibilidad\\": \\"publico\\",\\n  \\"datos\\": {\\n    \\"nombre\\": \\"Juan\\",\\n    \\"apellido\\": \\"Pérez\\",\\n    \\"email\\": \\"juan@email.com\\"\\n  }\\n}"
            }
          }
        },
        {
          "name": "Listar Tarjetas",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/cliente/tarjetas?limite=10&pagina=1",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenCliente}}" }]
          }
        },
        {
          "name": "Tarjeta Pública",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/tarjetas/publicas/:slug",
            "header": []
          }
        }
      ]
    },
    {
      "name": "3. QR",
      "item": [
        {
          "name": "Generar QR",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/qr/generate",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"url\\": \\"https://tarjetasrenova.com/tarjeta/mi-tarjeta\\",\\n  \\"format\\": \\"base64\\",\\n  \\"size\\": 300\\n}"
            }
          }
        }
      ]
    },
    {
      "name": "4. Plantillas",
      "item": [
        {
          "name": "Listar Plantillas",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/plantillas",
            "header": []
          }
        },
        {
          "name": "Obtener Plantilla",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/plantillas/1",
            "header": []
          }
        },
        {
          "name": "Preview Plantilla",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/plantillas/1/preview",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\\n  \\"datos\\": {\\n    \\"nombre\\": \\"Juan\\",\\n    \\"empresa\\": \\"Mi Empresa\\"\\n  }\\n}"
            }
          }
        }
      ]
    },
    {
      "name": "5. Suscripciones",
      "item": [
        {
          "name": "Tipos de Suscripción",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/suscripciones/tipos",
            "header": []
          }
        },
        {
          "name": "Mi Suscripción",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/cliente/suscripcion/mi-suscripcion",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenCliente}}" }]
          }
        },
        {
          "name": "Dashboard Cliente",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/cliente/dashboard",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenCliente}}" }]
          }
        }
      ]
    },
    {
      "name": "6. Administración",
      "item": [
        {
          "name": "Dashboard Stats",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/dashboard/stats",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        },
        {
          "name": "Listar Usuarios",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/usuarios",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        },
        {
          "name": "Variables Plantilla",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/variables",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        },
        {
          "name": "Categorías",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/categorias",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        },
        {
          "name": "Logs Auditoría",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/logs?limite=20",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        }
      ]
    },
    {
      "name": "7. 2FA",
      "item": [
        {
          "name": "Activar 2FA",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/2fa/enable",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        },
        {
          "name": "Estado 2FA",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/2fa/status",
            "header": [{ "key": "Authorization", "value": "Bearer {{tokenAdmin}}" }]
          }
        }
      ]
    }
  ]
}`)}</pre>
          </div>

          <div class="info-card">
              <h2>📝 Notas Adicionales</h2>
              <ul style="margin-left: 1.5rem;">
                  <li>Todas las respuestas son en formato JSON</li>
                  <li>Los tokens JWT expiran en 12 horas</li>
                  <li>Para rutas protegidas, incluir header: <code>Authorization: Bearer {token}</code></li>
                  <li>Las rutas de administración y clientes están separadas para mayor claridad</li>
                  <li>El email debe ser único en todo el sistema (no puede haber un admin y cliente con el mismo email)</li>
                  <li>Las plantillas usan variables con formato <code>$_nombre_$</code> para reemplazar contenido</li>
                  <li>Las variables se validan automáticamente al crear/actualizar plantillas</li>
                  <li>Los clientes pueden crear múltiples tarjetas usando diferentes plantillas</li>
                  <li>Los datos de las tarjetas se guardan en formato JSON, separados de la plantilla</li>
                  <li>Las tarjetas públicas se pueden compartir mediante un slug único</li>
                  <li>Cada tarjeta pública tiene un contador de visitas que se incrementa automáticamente</li>
                  <li>Se pueden generar códigos QR para compartir tarjetas de forma fácil</li>
                  <li>El sistema de suscripciones permite limitar el número de tarjetas por cliente</li>
                  <li>2FA (doble factor de autenticación) está disponible para mayor seguridad</li>
                  <li>Los logs de auditoría registran todas las acciones importantes del sistema</li>
                  <li>Rate limiting implementado para prevenir abusos (100 solicitudes por 15 minutos)</li>
              </ul>
          </div>
      </div>
      
      <div class="footer">
          <p>📇 Tarjetas Renova API v1.9.2 | Documentación completa para desarrolladores</p>
          <p style="margin-top: 0.5rem;">© 2026 Renova Automatizacion. Todos los derechos reservados.</p>
          <p style="margin-top: 0.5rem; font-size: 0.8rem;">✨ Creado por Alvaro Daniel Meza Ramirez para facilitar la integración de tarjetas digitales</p>
      </div>

      <script>
          const searchInput = document.getElementById('searchInput');
          const endpoints = document.querySelectorAll('.endpoint, .info-card');
          
          searchInput.addEventListener('input', function() {
              const searchTerm = this.value.toLowerCase();
              
              endpoints.forEach(endpoint => {
                  const text = endpoint.textContent.toLowerCase();
                  if (searchTerm === '' || text.includes(searchTerm)) {
                      endpoint.style.display = '';
                  } else {
                      endpoint.style.display = 'none';
                  }
              });
          });
      </script>
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
app.use("/api", adminRoutes);
app.use("/images", imageRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: "Consulta la documentación en / o /docs para ver los endpoints disponibles",
    documentacion: `${req.protocol}://${req.get("host")}/docs`
  });
});

module.exports = app;