const db = require("../config/db");
const { getMexicoISO } = require("../utils/date.utils");

const getTableNames = (tipo) => {
  if (tipo === 'cliente') {
    return { usuarios: 'usuarios_clientes' };
  }
  return { usuarios: 'usuarios' };
};

// Obtener todos los tipos de suscripción disponibles
exports.getTiposSuscripcion = async (req, res) => {
  try {
    const [tipos] = await db.execute(
      "SELECT * FROM tipos_suscripcion WHERE activo = 1 ORDER BY orden, precio_centavos"
    );
    
    return res.json({ tipos });
  } catch (error) {
    console.error("Error en getTiposSuscripcion:", error);
    return res.status(500).json({ error: "Error al obtener tipos de suscripción" });
  }
};

// Obtener suscripción actual del usuario
exports.getMiSuscripcion = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';
    const tablas = getTableNames(tipo);

    const [suscripciones] = await db.execute(
      `SELECT s.*, ts.nombre as plan_nombre, ts.descripcion as plan_descripcion,
              ts.max_tarjetas, ts.max_plantillas_personalizadas, ts.qr_dinamico,
              ts.analitica_avanzada, ts.soporte_prioritario, ts.duracion_dias,
              m.simbolo as moneda_simbolo, m.codigo as moneda_codigo
       FROM suscripciones_usuarios s
       INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
       LEFT JOIN monedas m ON ts.monedaid = m.monedaid
       WHERE s.usuarioid = ? AND s.tipo_usuario = ? AND s.estado = 'activa'
       ORDER BY s.suscripcionid DESC LIMIT 1`,
      [usuarioid, tipo]
    );

    if (suscripciones.length === 0) {
      // Buscar la última suscripción aunque esté vencida
      const [ultima] = await db.execute(
        `SELECT s.*, ts.nombre as plan_nombre, ts.max_tarjetas,
                m.simbolo as moneda_simbolo
         FROM suscripciones_usuarios s
         INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
         LEFT JOIN monedas m ON ts.monedaid = m.monedaid
         WHERE s.usuarioid = ? AND s.tipo_usuario = ?
         ORDER BY s.suscripcionid DESC LIMIT 1`,
        [usuarioid, tipo]
      );
      
      if (ultima.length > 0) {
        return res.json({
          tiene_suscripcion: false,
          ultima_suscripcion: ultima[0],
          mensaje: "No tienes una suscripción activa"
        });
      }
      
      return res.json({
        tiene_suscripcion: false,
        mensaje: "No tienes ninguna suscripción"
      });
    }

    const suscripcion = suscripciones[0];
    const dias_restantes = Math.ceil((new Date(suscripcion.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24));
    
    return res.json({
      tiene_suscripcion: true,
      suscripcion: {
        ...suscripcion,
        dias_restantes: dias_restantes > 0 ? dias_restantes : 0,
        esta_vencida: dias_restantes <= 0
      }
    });
  } catch (error) {
    console.error("Error en getMiSuscripcion:", error);
    return res.status(500).json({ error: "Error al obtener suscripción" });
  }
};

// Crear/renovar suscripción (simula pago)
exports.crearSuscripcion = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';
    const { tiposuscripcionid, metodo_pago = 'simulado', renovar_automatico = false } = req.body;

    if (!tiposuscripcionid) {
      return res.status(400).json({ error: "Se requiere el tipo de suscripción" });
    }

    // Obtener el tipo de suscripción
    const [tipos] = await db.execute(
      "SELECT * FROM tipos_suscripcion WHERE tiposuscripcionid = ? AND activo = 1",
      [tiposuscripcionid]
    );

    if (tipos.length === 0) {
      return res.status(404).json({ error: "Tipo de suscripción no encontrado" });
    }

    const plan = tipos[0];
    const fecha_inicio = getMexicoISO().split('T')[0];
    const fecha_fin = new Date();
    fecha_fin.setDate(fecha_fin.getDate() + plan.duracion_dias);
    const fecha_fin_str = fecha_fin.toISOString().split('T')[0];

    // Desactivar suscripciones activas anteriores
    await db.execute(
      `UPDATE suscripciones_usuarios 
       SET estado = 'cancelada', actualizado = NOW()
       WHERE usuarioid = ? AND tipo_usuario = ? AND estado = 'activa'`,
      [usuarioid, tipo]
    );

    // Crear nueva suscripción
    const [result] = await db.execute(
      `INSERT INTO suscripciones_usuarios 
       (usuarioid, tipo_usuario, tiposuscripcionid, fecha_inicio, fecha_fin, 
        fecha_ultima_renovacion, estado, automatico_renovar, ultimo_pago_id, notas)
       VALUES (?, ?, ?, ?, ?, NOW(), 'activa', ?, ?, ?)`,
      [usuarioid, tipo, tiposuscripcionid, fecha_inicio, fecha_fin_str, 
       renovar_automatico ? 1 : 0, `pago_${Date.now()}`, `Suscripción ${plan.nombre} - Método: ${metodo_pago}`]
    );

    // Registrar en historial
    await db.execute(
      `INSERT INTO historial_suscripciones 
       (suscripcionid, usuarioid, tipo_usuario, tiposuscripcionid, 
        fecha_inicio, fecha_fin, motivo, estado_anterior, estado_nuevo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, usuarioid, tipo, tiposuscripcionid, 
       fecha_inicio, fecha_fin_str, 'Nueva suscripción', 'none', 'activa']
    );

    return res.status(201).json({
      message: "Suscripción creada exitosamente",
      suscripcionid: result.insertId,
      fecha_inicio,
      fecha_fin: fecha_fin_str,
      plan: plan.nombre
    });
  } catch (error) {
    console.error("Error en crearSuscripcion:", error);
    return res.status(500).json({ error: "Error al crear suscripción" });
  }
};

// Cancelar suscripción
exports.cancelarSuscripcion = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';

    const [suscripciones] = await db.execute(
      `SELECT suscripcionid, tiposuscripcionid, fecha_inicio, fecha_fin, estado
       FROM suscripciones_usuarios
       WHERE usuarioid = ? AND tipo_usuario = ? AND estado = 'activa'
       ORDER BY suscripcionid DESC LIMIT 1`,
      [usuarioid, tipo]
    );

    if (suscripciones.length === 0) {
      return res.status(404).json({ error: "No tienes una suscripción activa" });
    }

    const suscripcion = suscripciones[0];
    const estado_anterior = suscripcion.estado;

    await db.execute(
      `UPDATE suscripciones_usuarios 
       SET estado = 'cancelada', automatico_renovar = 0, actualizado = NOW()
       WHERE suscripcionid = ?`,
      [suscripcion.suscripcionid]
    );

    await db.execute(
      `INSERT INTO historial_suscripciones 
       (suscripcionid, usuarioid, tipo_usuario, tiposuscripcionid, 
        fecha_inicio, fecha_fin, motivo, estado_anterior, estado_nuevo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [suscripcion.suscripcionid, usuarioid, tipo, suscripcion.tiposuscripcionid,
       suscripcion.fecha_inicio, suscripcion.fecha_fin, 
       'Cancelación por usuario', estado_anterior, 'cancelada']
    );

    return res.json({
      message: "Suscripción cancelada exitosamente"
    });
  } catch (error) {
    console.error("Error en cancelarSuscripcion:", error);
    return res.status(500).json({ error: "Error al cancelar suscripción" });
  }
};

// Historial de suscripciones del usuario
exports.getHistorialSuscripciones = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';
    const { limite = 20, pagina = 1 } = req.query;

    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);
    const offset = (paginaNum - 1) * limiteNum;

    const [historial] = await db.execute(
      `SELECT h.*, ts.nombre as plan_nombre, ts.precio_centavos, m.simbolo as moneda_simbolo
       FROM historial_suscripciones h
       INNER JOIN tipos_suscripcion ts ON h.tiposuscripcionid = ts.tiposuscripcionid
       LEFT JOIN monedas m ON ts.monedaid = m.monedaid
       WHERE h.usuarioid = ? AND h.tipo_usuario = ?
       ORDER BY h.fecha_cambio DESC
       LIMIT ? OFFSET ?`,
      [usuarioid, tipo, limiteNum, offset]
    );

    const [total] = await db.execute(
      `SELECT COUNT(*) as total FROM historial_suscripciones 
       WHERE usuarioid = ? AND tipo_usuario = ?`,
      [usuarioid, tipo]
    );

    return res.json({
      historial,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total: total[0].total,
        paginas: Math.ceil(total[0].total / limiteNum)
      }
    });
  } catch (error) {
    console.error("Error en getHistorialSuscripciones:", error);
    return res.status(500).json({ error: "Error al obtener historial" });
  }
};

// Dashboard - Estadísticas del usuario
exports.getDashboardStats = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';

    // Obtener suscripción activa
    const [suscripcionActiva] = await db.execute(
      `SELECT s.*, ts.max_tarjetas, ts.max_plantillas_personalizadas, 
              ts.qr_dinamico, ts.analitica_avanzada, ts.soporte_prioritario,
              ts.nombre as plan_nombre
       FROM suscripciones_usuarios s
       INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
       WHERE s.usuarioid = ? AND s.tipo_usuario = ? AND s.estado = 'activa'
       ORDER BY s.suscripcionid DESC LIMIT 1`,
      [usuarioid, tipo]
    );

    let limiteTarjetas = 3; // Plan básico por defecto
    let planActual = null;
    let diasRestantes = 0;

    if (suscripcionActiva.length > 0) {
      const sub = suscripcionActiva[0];
      limiteTarjetas = sub.max_tarjetas === 0 ? 999999 : sub.max_tarjetas;
      planActual = {
        id: sub.tiposuscripcionid,
        nombre: sub.plan_nombre,
        max_tarjetas: sub.max_tarjetas,
        qr_dinamico: sub.qr_dinamico === 1,
        analitica_avanzada: sub.analitica_avanzada === 1,
        soporte_prioritario: sub.soporte_prioritario === 1
      };
      diasRestantes = Math.max(0, Math.ceil((new Date(sub.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)));
    }

    // Contar tarjetas activas
    const [tarjetasCount] = await db.execute(
      `SELECT COUNT(*) as total FROM tarjetas_cliente 
       WHERE usuarioid = ? AND activo = 1`,
      [usuarioid]
    );
    const totalTarjetas = tarjetasCount[0].total;

    // Contar visitas totales a tarjetas públicas
    const [visitasCount] = await db.execute(
      `SELECT COALESCE(SUM(visitas), 0) as total FROM tarjetas_cliente 
       WHERE usuarioid = ? AND visibilidad = 'publico' AND activo = 1`,
      [usuarioid]
    );
    const totalVisitas = visitasCount[0].total;

    // Tarjetas más visitadas (top 5)
    const [topTarjetas] = await db.execute(
      `SELECT tarjetaclienteid, nombre_tarjeta, visitas, slug,
              (SELECT nombre FROM plantillas_tarjetas WHERE plantillaid = tc.plantillaid) as plantilla_nombre
       FROM tarjetas_cliente tc
       WHERE usuarioid = ? AND activo = 1 AND visitas > 0
       ORDER BY visitas DESC LIMIT 5`,
      [usuarioid]
    );

    // Actividad reciente (últimas 5 tarjetas creadas/modificadas)
    const [actividadReciente] = await db.execute(
      `SELECT tarjetaclienteid, nombre_tarjeta, creado, actualizado,
              (SELECT nombre FROM plantillas_tarjetas WHERE plantillaid = tc.plantillaid) as plantilla_nombre
       FROM tarjetas_cliente tc
       WHERE usuarioid = ? AND activo = 1
       ORDER BY actualizado DESC LIMIT 5`,
      [usuarioid]
    );

    // Verificar si puede crear más tarjetas
    const puedeCrearMas = totalTarjetas < limiteTarjetas || limiteTarjetas === 0;

    return res.json({
      suscripcion: {
        activa: suscripcionActiva.length > 0,
        plan: planActual,
        dias_restantes: diasRestantes,
        tarjetas_restantes: limiteTarjetas === 0 ? 'Ilimitadas' : Math.max(0, limiteTarjetas - totalTarjetas),
        limite_tarjetas: limiteTarjetas === 0 ? 'Ilimitadas' : limiteTarjetas
      },
      estadisticas: {
        total_tarjetas: totalTarjetas,
        total_visitas: totalVisitas,
        tarjetas_publicas: await (async () => {
          const [pub] = await db.execute(
            `SELECT COUNT(*) as total FROM tarjetas_cliente 
             WHERE usuarioid = ? AND visibilidad = 'publico' AND activo = 1`,
            [usuarioid]
          );
          return pub[0].total;
        })(),
        tarjetas_privadas: await (async () => {
          const [priv] = await db.execute(
            `SELECT COUNT(*) as total FROM tarjetas_cliente 
             WHERE usuarioid = ? AND visibilidad = 'privado' AND activo = 1`,
            [usuarioid]
          );
          return priv[0].total;
        })()
      },
      top_tarjetas: topTarjetas,
      actividad_reciente: actividadReciente,
      puede_crear_mas_tarjetas: puedeCrearMas,
      mensaje_limite: puedeCrearMas ? null : `Has alcanzado el límite de ${limiteTarjetas} tarjetas de tu plan. Actualiza tu suscripción para crear más.`
    });
  } catch (error) {
    console.error("Error en getDashboardStats:", error);
    return res.status(500).json({ error: "Error al obtener estadísticas del dashboard" });
  }
};

// Verificar límites antes de crear tarjeta (middleware/helper)
exports.verificarLimitesTarjetas = async (usuarioid, tipo = 'cliente') => {
  try {
    // Obtener suscripción activa
    const [suscripcion] = await db.execute(
      `SELECT ts.max_tarjetas
       FROM suscripciones_usuarios s
       INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
       WHERE s.usuarioid = ? AND s.tipo_usuario = ? AND s.estado = 'activa'
       ORDER BY s.suscripcionid DESC LIMIT 1`,
      [usuarioid, tipo]
    );

    let limiteTarjetas = 3; // Plan básico por defecto
    if (suscripcion.length > 0) {
      limiteTarjetas = suscripcion[0].max_tarjetas === 0 ? 999999 : suscripcion[0].max_tarjetas;
    }

    // Contar tarjetas activas
    const [tarjetasCount] = await db.execute(
      `SELECT COUNT(*) as total FROM tarjetas_cliente 
       WHERE usuarioid = ? AND activo = 1`,
      [usuarioid]
    );

    const totalTarjetas = tarjetasCount[0].total;
    
    return {
      puede_crear: totalTarjetas < limiteTarjetas,
      total_actual: totalTarjetas,
      limite: limiteTarjetas,
      mensaje: totalTarjetas >= limiteTarjetas ? `Has alcanzado el límite de ${limiteTarjetas} tarjetas` : null
    };
  } catch (error) {
    console.error("Error en verificarLimitesTarjetas:", error);
    return { puede_crear: true, total_actual: 0, limite: 999999, mensaje: null };
  }
};

// Obtener todas las suscripciones (solo admin)
exports.getAllSuscripciones = async (req, res) => {
  try {
    const { estado, tipo_usuario, limite = 50, pagina = 1 } = req.query;
    
    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);
    const offset = (paginaNum - 1) * limiteNum;

    let query = `
      SELECT s.*, ts.nombre as plan_nombre, ts.precio_centavos,
             u.nombre as usuario_nombre, u.email as usuario_email
      FROM suscripciones_usuarios s
      INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
      INNER JOIN ${tipo_usuario === 'cliente' ? 'usuarios_clientes' : 'usuarios'} u ON s.usuarioid = u.usuarioid
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      query += " AND s.estado = ?";
      params.push(estado);
    }
    if (tipo_usuario) {
      query += " AND s.tipo_usuario = ?";
      params.push(tipo_usuario);
    }

    query += " ORDER BY s.suscripcionid DESC LIMIT ? OFFSET ?";
    params.push(limiteNum, offset);

    const [suscripciones] = await db.execute(query, params);

    const [total] = await db.execute(
      `SELECT COUNT(*) as total FROM suscripciones_usuarios`,
      []
    );

    return res.json({
      suscripciones,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total: total[0].total,
        paginas: Math.ceil(total[0].total / limiteNum)
      }
    });
  } catch (error) {
    console.error("Error en getAllSuscripciones:", error);
    return res.status(500).json({ error: "Error al obtener suscripciones" });
  }
};

// Renovar suscripción manualmente (admin)
exports.renovarSuscripcionAdmin = async (req, res) => {
  try {
    const { suscripcionid } = req.params;
    const { dias_extra = null } = req.body;

    const [suscripciones] = await db.execute(
      `SELECT s.*, ts.duracion_dias, ts.nombre as plan_nombre
       FROM suscripciones_usuarios s
       INNER JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
       WHERE s.suscripcionid = ?`,
      [suscripcionid]
    );

    if (suscripciones.length === 0) {
      return res.status(404).json({ error: "Suscripción no encontrada" });
    }

    const suscripcion = suscripciones[0];
    const duracion = dias_extra || suscripcion.duracion_dias;
    
    let nuevaFechaFin = new Date();
    if (suscripcion.estado === 'activa' && new Date(suscripcion.fecha_fin) > new Date()) {
      nuevaFechaFin = new Date(suscripcion.fecha_fin);
    }
    nuevaFechaFin.setDate(nuevaFechaFin.getDate() + duracion);
    const nuevaFechaFinStr = nuevaFechaFin.toISOString().split('T')[0];

    await db.execute(
      `UPDATE suscripciones_usuarios 
       SET fecha_fin = ?, fecha_ultima_renovacion = NOW(), estado = 'activa', actualizado = NOW()
       WHERE suscripcionid = ?`,
      [nuevaFechaFinStr, suscripcionid]
    );

    await db.execute(
      `INSERT INTO historial_suscripciones 
       (suscripcionid, usuarioid, tipo_usuario, tiposuscripcionid, 
        fecha_inicio, fecha_fin, motivo, estado_anterior, estado_nuevo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [suscripcionid, suscripcion.usuarioid, suscripcion.tipo_usuario, suscripcion.tiposuscripcionid,
       suscripcion.fecha_inicio, nuevaFechaFinStr, 
       `Renovación admin - ${duracion} días`, suscripcion.estado, 'activa']
    );

    return res.json({
      message: "Suscripción renovada exitosamente",
      nueva_fecha_fin: nuevaFechaFinStr
    });
  } catch (error) {
    console.error("Error en renovarSuscripcionAdmin:", error);
    return res.status(500).json({ error: "Error al renovar suscripción" });
  }
};