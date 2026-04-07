const db = require("../config/db");

// ========== GESTIÓN DE USUARIOS ==========

// Obtener todos los usuarios (admins y clientes)
exports.getUsuarios = async (req, res) => {
  try {
    const { tipo, busqueda, activo } = req.query;
    
    let queryAdmins = "SELECT usuarioid, nombre, email, rolid, activo, creado, ultimo_login, 'admin' as tipo_usuario FROM usuarios";
    let queryClientes = "SELECT usuarioid, nombre, email, rolid, activo, creado, ultimo_login, 'cliente' as tipo_usuario FROM usuarios_clientes";
    const params = [];
    
    if (tipo === 'admin') {
      queryClientes += " WHERE 1=0"; // No mostrar clientes
      if (activo !== undefined) {
        queryAdmins += " WHERE activo = ?";
        params.push(activo);
      }
    } else if (tipo === 'cliente') {
      queryAdmins += " WHERE 1=0"; // No mostrar admins
      if (activo !== undefined) {
        queryClientes += " WHERE activo = ?";
        params.push(activo);
      }
    } else {
      // Ambos tipos
      if (activo !== undefined) {
        queryAdmins += " WHERE activo = ?";
        queryClientes += " WHERE activo = ?";
        params.push(activo, activo);
      }
    }
    
    if (busqueda) {
      const searchParam = `%${busqueda}%`;
      if (tipo === 'admin' || !tipo) {
        queryAdmins += (queryAdmins.includes('WHERE') ? ' AND' : ' WHERE') + " (nombre LIKE ? OR email LIKE ?)";
        params.push(searchParam, searchParam);
      }
      if (tipo === 'cliente' || !tipo) {
        queryClientes += (queryClientes.includes('WHERE') ? ' AND' : ' WHERE') + " (nombre LIKE ? OR email LIKE ?)";
        params.push(searchParam, searchParam);
      }
    }
    
    const [admins] = await db.execute(queryAdmins, params.slice(0, params.length / 2));
    const [clientes] = await db.execute(queryClientes, params.slice(params.length / 2));
    
    return res.json({
      admins,
      clientes,
      total_admins: admins.length,
      total_clientes: clientes.length,
      total: admins.length + clientes.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;
    
    let user = null;
    let tabla = tipo === 'cliente' ? 'usuarios_clientes' : 'usuarios';
    
    const [rows] = await db.execute(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM ${tabla} u
       LEFT JOIN roles r ON u.rolid = r.rolid
       WHERE u.usuarioid = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    user = rows[0];
    
    // Si es cliente, obtener información adicional
    if (tipo === 'cliente') {
      const [clienteInfo] = await db.execute(
        "SELECT * FROM clientes WHERE usuarioid = ?",
        [id]
      );
      user.cliente_info = clienteInfo[0] || null;
    }
    
    // Obtener suscripciones del usuario
    const [suscripciones] = await db.execute(
      `SELECT s.*, ts.nombre as plan_nombre 
       FROM suscripciones_usuarios s
       LEFT JOIN tipos_suscripcion ts ON s.tiposuscripcionid = ts.tiposuscripcionid
       WHERE s.usuarioid = ? AND s.tipo_usuario = ?
       ORDER BY s.suscripcionid DESC`,
      [id, tipo === 'cliente' ? 'cliente' : 'admin']
    );
    
    user.suscripciones = suscripciones;
    
    return res.json({ usuario: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Actualizar rol de un usuario
exports.updateUsuarioRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rolid, tipo = 'admin' } = req.body;
    
    // Validar que no sea el propio admin cambiándose a sí mismo
    if (parseInt(id) === req.user.usuarioid && req.user.tipo === 'admin') {
      return res.status(400).json({ error: "No puedes cambiar tu propio rol" });
    }
    
    // Validar rol existente
    const [roles] = await db.execute("SELECT rolid, nombre FROM roles WHERE rolid = ?", [rolid]);
    if (roles.length === 0) {
      return res.status(400).json({ error: "Rol no válido" });
    }
    
    const tabla = tipo === 'cliente' ? 'usuarios_clientes' : 'usuarios';
    
    const [result] = await db.execute(
      `UPDATE ${tabla} SET rolid = ? WHERE usuarioid = ?`,
      [rolid, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Registrar en log de auditoría
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'cambio_rol', 'usuario', id, JSON.stringify({ nuevo_rol: rolid, nuevo_rol_nombre: roles[0].nombre }), req.ip]
    );
    
    return res.json({ 
      message: "Rol actualizado exitosamente",
      nuevo_rol: roles[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar rol" });
  }
};

// Activar/desactivar usuario
exports.updateUsuarioEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo, tipo = 'admin' } = req.body;
    
    // Validar que no sea el propio admin desactivándose
    if (parseInt(id) === req.user.usuarioid && req.user.tipo === 'admin') {
      return res.status(400).json({ error: "No puedes desactivar tu propia cuenta" });
    }
    
    const tabla = tipo === 'cliente' ? 'usuarios_clientes' : 'usuarios';
    
    const [result] = await db.execute(
      `UPDATE ${tabla} SET activo = ? WHERE usuarioid = ?`,
      [activo, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, activo === 1 ? 'activar_usuario' : 'desactivar_usuario', 'usuario', id, JSON.stringify({ nuevo_estado: activo === 1 ? 'activo' : 'inactivo' }), req.ip]
    );
    
    return res.json({ 
      message: activo === 1 ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
};

// Eliminar usuario (soft delete)
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = 'admin' } = req.body;
    
    // Validar que no sea el propio admin eliminándose
    if (parseInt(id) === req.user.usuarioid && req.user.tipo === 'admin') {
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
    }
    
    const tabla = tipo === 'cliente' ? 'usuarios_clientes' : 'usuarios';
    
    const [result] = await db.execute(
      `UPDATE ${tabla} SET activo = 0, eliminado = 1 WHERE usuarioid = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'eliminar_usuario', 'usuario', id, JSON.stringify({ tipo_usuario: tipo }), req.ip]
    );
    
    return res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// ========== ESTADÍSTICAS GLOBALES ==========

// Dashboard stats para admin
exports.getGlobalStats = async (req, res) => {
  try {
    const [totalAdmins] = await db.execute("SELECT COUNT(*) as total FROM usuarios WHERE activo = 1");
    const [totalClientes] = await db.execute("SELECT COUNT(*) as total FROM usuarios_clientes WHERE activo = 1");
    const [totalPlantillas] = await db.execute("SELECT COUNT(*) as total FROM plantillas_tarjetas WHERE activo = 1");
    const [totalTarjetas] = await db.execute("SELECT COUNT(*) as total FROM tarjetas_cliente WHERE activo = 1");
    const [totalVisitas] = await db.execute("SELECT SUM(visitas) as total FROM tarjetas_cliente");
    const [suscripcionesActivas] = await db.execute(
      "SELECT COUNT(*) as total FROM suscripciones_usuarios WHERE estado = 'activa'"
    );
    
    // Tarjetas por plan
    const [tarjetasPorPlantilla] = await db.execute(
      `SELECT p.nombre, COUNT(tc.tarjetaclienteid) as total 
       FROM plantillas_tarjetas p
       LEFT JOIN tarjetas_cliente tc ON p.plantillaid = tc.plantillaid AND tc.activo = 1
       WHERE p.activo = 1
       GROUP BY p.plantillaid
       ORDER BY total DESC
       LIMIT 5`
    );
    
    // Actividad reciente
    const [actividadReciente] = await db.execute(
      `SELECT l.*, 
              COALESCE(u.nombre, uc.nombre) as admin_nombre
       FROM logs_auditoria l
       LEFT JOIN usuarios u ON l.admin_id = u.usuarioid
       LEFT JOIN usuarios_clientes uc ON l.admin_id = uc.usuarioid
       ORDER BY l.fecha DESC
       LIMIT 20`
    );
    
    return res.json({
      usuarios: {
        admins: totalAdmins[0].total,
        clientes: totalClientes[0].total,
        total: totalAdmins[0].total + totalClientes[0].total
      },
      contenido: {
        plantillas: totalPlantillas[0].total,
        tarjetas: totalTarjetas[0].total,
        visitas_totales: totalVisitas[0].total || 0
      },
      suscripciones_activas: suscripcionesActivas[0].total,
      tarjetas_populares: tarjetasPorPlantilla,
      actividad_reciente: actividadReciente
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

// Estadísticas de visitas
exports.getEstadisticasVisitas = async (req, res) => {
  try {
    const { periodo = '30dias' } = req.query;
    
    let dateCondition = "";
    switch(periodo) {
      case '7dias':
        dateCondition = "AND creado >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
      case '30dias':
        dateCondition = "AND creado >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
      case '90dias':
        dateCondition = "AND creado >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
        break;
      default:
        dateCondition = "";
    }
    
    const [visitasPorDia] = await db.execute(
      `SELECT DATE(creado) as fecha, COUNT(*) as total, SUM(visitas) as visitas
       FROM tarjetas_cliente
       WHERE activo = 1 ${dateCondition}
       GROUP BY DATE(creado)
       ORDER BY fecha DESC
       LIMIT 30`
    );
    
    const [topTarjetas] = await db.execute(
      `SELECT tc.tarjetaclienteid, tc.nombre_tarjeta, tc.visitas, tc.slug,
              COALESCE(u.nombre, uc.nombre) as usuario_nombre
       FROM tarjetas_cliente tc
       LEFT JOIN usuarios u ON tc.usuarioid = u.usuarioid
       LEFT JOIN usuarios_clientes uc ON tc.usuarioid = uc.usuarioid
       WHERE tc.visibilidad = 'publico' AND tc.activo = 1
       ORDER BY tc.visitas DESC
       LIMIT 10`
    );
    
    return res.json({
      periodo,
      total_visitas_periodo: visitasPorDia.reduce((sum, day) => sum + day.visitas, 0),
      visitas_por_dia: visitasPorDia,
      top_tarjetas: topTarjetas
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas de visitas" });
  }
};

// Estadísticas de tarjetas
exports.getEstadisticasTarjetas = async (req, res) => {
  try {
    const [tarjetasPorCliente] = await db.execute(
      `SELECT 
         COALESCE(u.nombre, uc.nombre) as nombre,
         COALESCE(u.email, uc.email) as email,
         COUNT(tc.tarjetaclienteid) as total_tarjetas,
         SUM(CASE WHEN tc.visibilidad = 'publico' THEN 1 ELSE 0 END) as publicas,
         SUM(CASE WHEN tc.visibilidad = 'privado' THEN 1 ELSE 0 END) as privadas,
         SUM(tc.visitas) as total_visitas
       FROM tarjetas_cliente tc
       LEFT JOIN usuarios u ON tc.usuarioid = u.usuarioid
       LEFT JOIN usuarios_clientes uc ON tc.usuarioid = uc.usuarioid
       WHERE tc.activo = 1
       GROUP BY tc.usuarioid
       ORDER BY total_tarjetas DESC
       LIMIT 20`
    );
    
    const [tarjetasPorPlantilla] = await db.execute(
      `SELECT p.nombre, COUNT(tc.tarjetaclienteid) as total
       FROM plantillas_tarjetas p
       LEFT JOIN tarjetas_cliente tc ON p.plantillaid = tc.plantillaid AND tc.activo = 1
       WHERE p.activo = 1
       GROUP BY p.plantillaid
       ORDER BY total DESC`
    );
    
    return res.json({
      top_clientes: tarjetasPorCliente,
      tarjetas_por_plantilla: tarjetasPorPlantilla
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener estadísticas de tarjetas" });
  }
};

// ========== GESTIÓN DE VARIABLES ==========

exports.getVariablesAdmin = async (req, res) => {
  try {
    const [variables] = await db.execute(
      "SELECT * FROM variables_plantilla ORDER BY orden"
    );
    return res.json({ variables });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener variables" });
  }
};

exports.createVariable = async (req, res) => {
  try {
    const { nombre, etiqueta, descripcion, tipo_dato, ejemplo, es_requerida, orden } = req.body;
    
    if (!nombre || !etiqueta) {
      return res.status(400).json({ error: "Nombre y etiqueta son requeridos" });
    }
    
    const [result] = await db.execute(
      `INSERT INTO variables_plantilla (nombre, etiqueta, descripcion, tipo_dato, ejemplo, es_requerida, orden, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [nombre, etiqueta, descripcion || null, tipo_dato || 'texto', ejemplo || null, es_requerida || 0, orden || 999]
    );
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'crear_variable', 'variable_plantilla', result.insertId, JSON.stringify({ nombre, etiqueta }), req.ip]
    );
    
    return res.status(201).json({
      message: "Variable creada exitosamente",
      variableid: result.insertId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear variable" });
  }
};

exports.updateVariable = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, etiqueta, descripcion, tipo_dato, ejemplo, es_requerida, orden, activo } = req.body;
    
    const [result] = await db.execute(
      `UPDATE variables_plantilla SET
        nombre = COALESCE(?, nombre),
        etiqueta = COALESCE(?, etiqueta),
        descripcion = COALESCE(?, descripcion),
        tipo_dato = COALESCE(?, tipo_dato),
        ejemplo = COALESCE(?, ejemplo),
        es_requerida = COALESCE(?, es_requerida),
        orden = COALESCE(?, orden),
        activo = COALESCE(?, activo)
       WHERE variableid = ?`,
      [nombre, etiqueta, descripcion, tipo_dato, ejemplo, es_requerida, orden, activo, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variable no encontrada" });
    }
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'actualizar_variable', 'variable_plantilla', id, JSON.stringify(req.body), req.ip]
    );
    
    return res.json({ message: "Variable actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar variable" });
  }
};

exports.deleteVariable = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no esté siendo usada
    const [enUso] = await db.execute(
      "SELECT COUNT(*) as total FROM plantillas_variables WHERE variableid = ?",
      [id]
    );
    
    if (enUso[0].total > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar la variable porque está siendo usada en plantillas",
        plantillas_asociadas: enUso[0].total
      });
    }
    
    const [result] = await db.execute(
      "DELETE FROM variables_plantilla WHERE variableid = ?",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variable no encontrada" });
    }
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'eliminar_variable', 'variable_plantilla', id, JSON.stringify({}), req.ip]
    );
    
    return res.json({ message: "Variable eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar variable" });
  }
};

// ========== GESTIÓN DE CATEGORÍAS ==========

exports.getCategorias = async (req, res) => {
  try {
    const [categorias] = await db.execute(
      "SELECT c.*, COUNT(p.categoriaid) as total_plantillas FROM categorias c LEFT JOIN plantillas_tarjetas p ON c.categoriaid = p.categoriaid AND p.activo = 1 GROUP BY c.categoriaid ORDER BY c.orden, c.nombre"
    );
    return res.json({ categorias });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener categorías" });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, orden, activo } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: "Nombre es requerido" });
    }
    
    const [result] = await db.execute(
      `INSERT INTO categorias (nombre, descripcion, orden, activo)
       VALUES (?, ?, ?, ?)`,
      [nombre, descripcion || null, orden || 999, activo !== undefined ? activo : 1]
    );
    
    await db.execute(
      `INSERT INTO logs_auditoria (admin_id, accion, entidad, entidad_id, detalles, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.usuarioid, 'crear_categoria', 'categoria', result.insertId, JSON.stringify({ nombre }), req.ip]
    );
    
    return res.status(201).json({
      message: "Categoría creada exitosamente",
      categoriaid: result.insertId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear categoría" });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo } = req.body;
    
    const [result] = await db.execute(
      `UPDATE categorias SET
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        orden = COALESCE(?, orden),
        activo = COALESCE(?, activo)
       WHERE categoriaid = ?`,
      [nombre, descripcion, orden, activo, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    
    return res.json({ message: "Categoría actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no tenga plantillas asociadas
    const [plantillas] = await db.execute(
      "SELECT COUNT(*) as total FROM plantillas_tarjetas WHERE categoriaid = ? AND activo = 1",
      [id]
    );
    
    if (plantillas[0].total > 0) {
      return res.status(400).json({ 
        error: "No se puede eliminar la categoría porque tiene plantillas asociadas",
        plantillas_asociadas: plantillas[0].total
      });
    }
    
    const [result] = await db.execute(
      "DELETE FROM categorias WHERE categoriaid = ?",
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    
    return res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar categoría" });
  }
};

// ========== LOGS DE AUDITORÍA ==========

exports.getLogs = async (req, res) => {
  try {
    const { limite = 50, pagina = 1, accion, admin_id } = req.query;
    
    const limiteNum = parseInt(limite);
    const paginaNum = parseInt(pagina);
    const offset = (paginaNum - 1) * limiteNum;
    
    let query = `
      SELECT l.*, 
             COALESCE(u.nombre, uc.nombre) as admin_nombre,
             COALESCE(u.email, uc.email) as admin_email
      FROM logs_auditoria l
      LEFT JOIN usuarios u ON l.admin_id = u.usuarioid
      LEFT JOIN usuarios_clientes uc ON l.admin_id = uc.usuarioid
      WHERE 1=1
    `;
    const params = [];
    
    if (accion) {
      query += " AND l.accion = ?";
      params.push(accion);
    }
    
    if (admin_id) {
      query += " AND l.admin_id = ?";
      params.push(admin_id);
    }
    
    query += " ORDER BY l.fecha DESC LIMIT ? OFFSET ?";
    params.push(limiteNum, offset);
    
    const [logs] = await db.execute(query, params);
    
    const [total] = await db.execute(
      "SELECT COUNT(*) as total FROM logs_auditoria",
      []
    );
    
    return res.json({
      logs,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total: total[0].total,
        paginas: Math.ceil(total[0].total / limiteNum)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener logs" });
  }
};

exports.getLogsByUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { limite = 50 } = req.query;
    
    const [logs] = await db.execute(
      `SELECT l.*, 
              COALESCE(u.nombre, uc.nombre) as admin_nombre
       FROM logs_auditoria l
       LEFT JOIN usuarios u ON l.admin_id = u.usuarioid
       LEFT JOIN usuarios_clientes uc ON l.admin_id = uc.usuarioid
       WHERE l.entidad_id = ? AND l.entidad = 'usuario'
       ORDER BY l.fecha DESC
       LIMIT ?`,
      [id, parseInt(limite)]
    );
    
    return res.json({ logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener logs del usuario" });
  }
};