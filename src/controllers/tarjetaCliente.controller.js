const db = require("../config/db");
const slugify = require("slugify");
const { getMexicoISO } = require("../utils/date.utils");
const suscripcionController = require("./suscripcion.controller");
const { validateImageVariables } = require("../utils/image.utils");

const renderPlantillaConDatos = (htmlContent, datos) => {
  let htmlRenderizado = htmlContent;
  for (const [key, value] of Object.entries(datos)) {
    const patron = new RegExp(`\\$_${key}_\\$`, 'g');
    htmlRenderizado = htmlRenderizado.replace(patron, value || `[${key}]`);
  }
  return htmlRenderizado;
};

exports.createTarjeta = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const tipo = req.user.tipo || 'cliente';
    const { plantillaid, nombre_tarjeta, datos, visibilidad = 'privado' } = req.body;

    const limites = await suscripcionController.verificarLimitesTarjetas(usuarioid, tipo);
    
    if (!limites.puede_crear) {
      return res.status(403).json({
        error: "Límite de tarjetas alcanzado",
        mensaje: limites.mensaje,
        limite: limites.limite,
        actual: limites.total_actual
      });
    }

    if (!plantillaid || !nombre_tarjeta || !datos) {
      return res.status(400).json({ error: "Faltan campos requeridos: plantillaid, nombre_tarjeta, datos" });
    }

    const plantillaIdNum = parseInt(plantillaid);
    if (isNaN(plantillaIdNum)) {
      return res.status(400).json({ error: "plantillaid debe ser un número válido" });
    }

    const [plantilla] = await db.execute(
      "SELECT plantillaid FROM plantillas_tarjetas WHERE plantillaid = ? AND activo = 1", 
      [plantillaIdNum]
    );
    
    if (plantilla.length === 0) {
      return res.status(404).json({ error: "Plantilla no encontrada o inactiva" });
    }

    const [variablesRequeridas] = await db.execute(
      `SELECT v.nombre FROM variables_plantilla v
       INNER JOIN plantillas_variables pv ON v.variableid = pv.variableid
       WHERE pv.plantillaid = ? AND pv.es_requerida = 1`,
      [plantillaIdNum]
    );

    let datosCliente;
    try {
      datosCliente = typeof datos === 'string' ? JSON.parse(datos) : datos;
    } catch (e) {
      return res.status(400).json({ error: "El campo datos debe ser un JSON válido" });
    }

    const imageValidation = validateImageVariables(datosCliente);
    if (!imageValidation.valid) {
      return res.status(400).json({
        error: "Error en imágenes",
        detalles: imageValidation.errors
      });
    }

    const nombresVariablesRequeridas = variablesRequeridas.map(v => v.nombre);
    const variablesFaltantes = nombresVariablesRequeridas.filter(nombreVar => !datosCliente.hasOwnProperty(nombreVar));

    if (variablesFaltantes.length > 0) {
      return res.status(400).json({
        error: "Los datos no contienen todas las variables requeridas",
        variables_faltantes: variablesFaltantes
      });
    }

    const datosJSON = JSON.stringify(datosCliente);

    const [result] = await db.execute(
      `INSERT INTO tarjetas_cliente (usuarioid, plantillaid, nombre_tarjeta, datos, visibilidad)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioid, plantillaIdNum, nombre_tarjeta, datosJSON, visibilidad]
    );

    return res.status(201).json({
      message: "Tarjeta creada exitosamente",
      tarjetaclienteid: result.insertId,
      limites_restantes: {
        usadas: limites.total_actual + 1,
        limite: limites.limite,
        disponibles: limites.limite - (limites.total_actual + 1)
      }
    });

  } catch (error) {
    console.error("Error en createTarjeta:", error);
    return res.status(500).json({ error: "Error al crear la tarjeta" });
  }
};

exports.getMisTarjetas = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    console.log("Usuario ID:", usuarioid);
    
    const { 
      plantillaid, 
      visibilidad, 
      busqueda, 
      orden = 'creado', 
      direccion = 'DESC', 
      limite = '10', 
      pagina = '1' 
    } = req.query;
    
    const limiteNum = parseInt(limite) || 10;
    const paginaNum = parseInt(pagina) || 1;

    const countParams = [];
    let countQuery = "SELECT COUNT(*) as total FROM tarjetas_cliente WHERE usuarioid = ? AND activo = 1";
    countParams.push(usuarioid);
    
    if (plantillaid) {
      const plantillaIdNum = parseInt(plantillaid);
      if (!isNaN(plantillaIdNum)) {
        countQuery += " AND plantillaid = ?";
        countParams.push(plantillaIdNum);
      }
    }
    
    if (visibilidad) {
      countQuery += " AND visibilidad = ?";
      countParams.push(visibilidad);
    }
    
    if (busqueda) {
      countQuery += " AND (nombre_tarjeta LIKE ? OR datos LIKE ?)";
      countParams.push(`%${busqueda}%`, `%${busqueda}%`);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const totalCount = countResult[0].total;

    let query = `
      SELECT 
        tc.tarjetaclienteid, 
        tc.nombre_tarjeta, 
        tc.datos, 
        tc.visibilidad, 
        tc.creado, 
        tc.actualizado,
        tc.slug,
        tc.visitas,
        p.nombre as plantilla_nombre, 
        p.plantillaid, 
        p.preview_image
      FROM tarjetas_cliente tc
      INNER JOIN plantillas_tarjetas p ON tc.plantillaid = p.plantillaid
      WHERE tc.usuarioid = ? AND tc.activo = 1
    `;

    const params = [usuarioid];

    if (plantillaid) {
      const plantillaIdNum = parseInt(plantillaid);
      if (!isNaN(plantillaIdNum)) {
        query += " AND tc.plantillaid = ?";
        params.push(plantillaIdNum);
      }
    }

    if (visibilidad) {
      query += " AND tc.visibilidad = ?";
      params.push(visibilidad);
    }

    if (busqueda) {
      query += " AND (tc.nombre_tarjeta LIKE ? OR tc.datos LIKE ?)";
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    const ordenPermitido = ['creado', 'nombre_tarjeta', 'actualizado'];
    const campoOrden = ordenPermitido.includes(orden) ? orden : 'creado';
    const direccionOrden = direccion.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const offset = (paginaNum - 1) * limiteNum;
    
    query += ` ORDER BY tc.${campoOrden} ${direccionOrden} LIMIT ${limiteNum} OFFSET ${offset}`;

    const [tarjetas] = await db.execute(query, params);

    const tarjetasConVisibilidad = tarjetas.map(tarjeta => ({
      ...tarjeta,
      visitas_visibles: tarjeta.visibilidad === 'publico' ? (tarjeta.visitas || 0) : 0
    }));

    return res.json({
      tarjetas: tarjetasConVisibilidad,
      paginacion: {
        pagina: paginaNum,
        limite: limiteNum,
        total: totalCount,
        paginas: Math.ceil(totalCount / limiteNum)
      }
    });

  } catch (error) {
    console.error("ERROR DETALLADO en getMisTarjetas:", error);
    return res.status(500).json({ 
      error: "Error al obtener tarjetas",
      detalle: error.message
    });
  }
};

exports.getTarjeta = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const { id } = req.params;

    const tarjetaId = parseInt(id);
    if (isNaN(tarjetaId)) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    const [tarjetas] = await db.execute(
      `SELECT 
        tc.*, 
        p.html_content, 
        p.css_content, 
        p.usa_bootstrap, 
        p.usa_bootstrap_icons, 
        p.bootstrap_version, 
        p.nombre as plantilla_nombre
       FROM tarjetas_cliente tc
       INNER JOIN plantillas_tarjetas p ON tc.plantillaid = p.plantillaid
       WHERE tc.tarjetaclienteid = ? AND tc.usuarioid = ? AND tc.activo = 1`,
      [tarjetaId, usuarioid]
    );

    if (tarjetas.length === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    const tarjeta = tarjetas[0];
    let datosCliente = {};
    
    try {
      datosCliente = JSON.parse(tarjeta.datos);
    } catch (e) {
      console.error("Error parseando datos de tarjeta:", e);
    }

    const htmlRenderizado = renderPlantillaConDatos(tarjeta.html_content, datosCliente);

    const response = {
      tarjetaclienteid: tarjeta.tarjetaclienteid,
      nombre_tarjeta: tarjeta.nombre_tarjeta,
      plantilla_nombre: tarjeta.plantilla_nombre,
      plantillaid: tarjeta.plantillaid,
      visibilidad: tarjeta.visibilidad,
      slug: tarjeta.slug,
      datos: datosCliente,
      creado: tarjeta.creado,
      actualizado: tarjeta.actualizado,
      renderizado: {
        html: htmlRenderizado,
        css: tarjeta.css_content,
        usa_bootstrap: tarjeta.usa_bootstrap === 1,
        usa_bootstrap_icons: tarjeta.usa_bootstrap_icons === 1,
        bootstrap_version: tarjeta.bootstrap_version
      }
    };

    return res.json(response);

  } catch (error) {
    console.error("Error en getTarjeta:", error);
    return res.status(500).json({ error: "Error al obtener la tarjeta" });
  }
};

exports.getTarjetaPublica = async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log("Buscando tarjeta pública con slug:", slug);

    const [tarjetaBasica] = await db.execute(
      "SELECT * FROM tarjetas_cliente WHERE slug = ? AND visibilidad = 'publico' AND activo = 1",
      [slug]
    );
    
    console.log("Tarjeta básica encontrada:", tarjetaBasica);

    if (tarjetaBasica.length === 0) {
      return res.status(404).json({ 
        error: "Tarjeta no encontrada",
        detalles: "Verifica que el slug sea correcto y que la tarjeta sea pública"
      });
    }

    const [tarjetas] = await db.execute(
      `SELECT 
        tc.*, 
        p.html_content, 
        p.css_content, 
        p.usa_bootstrap, 
        p.usa_bootstrap_icons, 
        p.bootstrap_version, 
        p.nombre as plantilla_nombre
       FROM tarjetas_cliente tc
       INNER JOIN plantillas_tarjetas p ON tc.plantillaid = p.plantillaid
       WHERE tc.slug = ? AND tc.visibilidad = 'publico' AND tc.activo = 1`,
      [slug]
    );

    if (tarjetas.length === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada o no es pública" });
    }

    const tarjeta = tarjetas[0];
    let datosCliente = {};
    
    try {
      datosCliente = JSON.parse(tarjeta.datos);
    } catch (e) {
      console.error("Error parseando datos de tarjeta:", e);
    }

    const htmlRenderizado = renderPlantillaConDatos(tarjeta.html_content, datosCliente);

    await db.execute(
      "UPDATE tarjetas_cliente SET visitas = IFNULL(visitas, 0) + 1 WHERE tarjetaclienteid = ?",
      [tarjeta.tarjetaclienteid]
    );

    const response = {
      tarjetaclienteid: tarjeta.tarjetaclienteid,
      nombre_tarjeta: tarjeta.nombre_tarjeta,
      plantilla_nombre: tarjeta.plantilla_nombre,
      slug: tarjeta.slug,
      visitas: tarjeta.visitas + 1,
      renderizado: {
        html: htmlRenderizado,
        css: tarjeta.css_content,
        usa_bootstrap: tarjeta.usa_bootstrap === 1,
        usa_bootstrap_icons: tarjeta.usa_bootstrap_icons === 1,
        bootstrap_version: tarjeta.bootstrap_version
      }
    };

    return res.json(response);

  } catch (error) {
    console.error("Error DETALLADO en getTarjetaPublica:", error);
    return res.status(500).json({ 
      error: "Error al obtener la tarjeta pública",
      detalle: error.message
    });
  }
};

exports.updateTarjeta = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const { id } = req.params;
    const { plantillaid, nombre_tarjeta, datos, visibilidad } = req.body;

    const tarjetaId = parseInt(id);
    if (isNaN(tarjetaId)) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    const [existe] = await db.execute(
      "SELECT tarjetaclienteid, nombre_tarjeta FROM tarjetas_cliente WHERE tarjetaclienteid = ? AND usuarioid = ? AND activo = 1",
      [tarjetaId, usuarioid]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    let datosJSON = null;
    if (datos) {
      try {
        const datosObj = typeof datos === 'string' ? JSON.parse(datos) : datos;
        
        const imageValidation = validateImageVariables(datosObj);
        if (!imageValidation.valid) {
          return res.status(400).json({
            error: "Error en imágenes",
            detalles: imageValidation.errors
          });
        }
        
        datosJSON = JSON.stringify(datosObj);
      } catch (e) {
        return res.status(400).json({ error: "El campo datos debe ser un JSON válido" });
      }
    }

    let slug = null;
    if (visibilidad === 'publico') {
      const nombreBase = nombre_tarjeta || existe[0].nombre_tarjeta;
      slug = slugify(`${nombreBase}-${tarjetaId}`, { lower: true, strict: true });
    }

    const updates = [];
    const updateParams = [];

    if (plantillaid !== undefined) {
      const plantillaIdNum = parseInt(plantillaid);
      if (!isNaN(plantillaIdNum)) {
        updates.push("plantillaid = ?");
        updateParams.push(plantillaIdNum);
      }
    }
    
    if (nombre_tarjeta !== undefined) {
      updates.push("nombre_tarjeta = ?");
      updateParams.push(nombre_tarjeta);
    }
    
    if (datosJSON !== null) {
      updates.push("datos = ?");
      updateParams.push(datosJSON);
    }
    
    if (visibilidad !== undefined) {
      updates.push("visibilidad = ?");
      updateParams.push(visibilidad);
    }
    
    if (slug !== null) {
      updates.push("slug = ?");
      updateParams.push(slug);
    }

    if (updates.length > 0) {
      updates.push("actualizado = NOW()");
      const updateQuery = `UPDATE tarjetas_cliente SET ${updates.join(', ')} WHERE tarjetaclienteid = ? AND usuarioid = ?`;
      updateParams.push(tarjetaId, usuarioid);
      
      await db.execute(updateQuery, updateParams);
    }

    return res.json({
      message: "Tarjeta actualizada exitosamente"
    });

  } catch (error) {
    console.error("Error en updateTarjeta:", error);
    return res.status(500).json({ error: "Error al actualizar la tarjeta" });
  }
};

exports.deleteTarjeta = async (req, res) => {
  try {
    const usuarioid = req.user.usuarioid;
    const { id } = req.params;

    const tarjetaId = parseInt(id);
    if (isNaN(tarjetaId)) {
      return res.status(400).json({ error: "ID de tarjeta inválido" });
    }

    const [result] = await db.execute(
      "UPDATE tarjetas_cliente SET activo = 0 WHERE tarjetaclienteid = ? AND usuarioid = ?",
      [tarjetaId, usuarioid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tarjeta no encontrada" });
    }

    return res.json({
      message: "Tarjeta eliminada exitosamente"
    });

  } catch (error) {
    console.error("Error en deleteTarjeta:", error);
    return res.status(500).json({ error: "Error al eliminar la tarjeta" });
  }
};