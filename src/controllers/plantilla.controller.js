const db = require("../config/db");
const { getMexicoISO } = require("../utils/date.utils");
const slugify = require("slugify");

// Validar que una plantilla contenga todas las variables requeridas
const validarVariablesPlantilla = (htmlContent, variablesRequeridas) => {
  const variablesFaltantes = [];
  
  variablesRequeridas.forEach(variable => {
    const patron = new RegExp(`\\$_${variable.nombre}_\\$`, 'g');
    if (!patron.test(htmlContent)) {
      variablesFaltantes.push(variable.nombre);
    }
  });
  
  return {
    valida: variablesFaltantes.length === 0,
    faltantes: variablesFaltantes
  };
};

// Obtener todas las variables disponibles
exports.getVariables = async (req, res) => {
  try {
    const [variables] = await db.execute(
      "SELECT * FROM variables_plantilla WHERE activo = 1 ORDER BY orden"
    );
    
    return res.json({
      variables
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener variables"
    });
  }
};

// Crear nueva plantilla
exports.createPlantilla = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      html_content,
      css_content,
      preview_image,
      categoriaid,
      usa_bootstrap,
      usa_bootstrap_icons,
      bootstrap_version,
      variables_requeridas // Array de IDs de variables requeridas
    } = req.body;

    if (!nombre || !html_content) {
      return res.status(400).json({
        error: "Nombre y contenido HTML son requeridos"
      });
    }

    // Generar slug automático
    const slug = slugify(nombre, { lower: true, strict: true });
    
    // Verificar slug único
    const [existing] = await db.execute(
      "SELECT plantillaid FROM plantillas_tarjetas WHERE slug = ?",
      [slug]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        error: "Ya existe una plantilla con ese nombre"
      });
    }

    // Obtener variables requeridas si se especificaron
    let variablesArray = [];
    if (variables_requeridas && Array.isArray(variables_requeridas)) {
      const placeholders = variables_requeridas.map(() => '?').join(',');
      const [variables] = await db.execute(
        `SELECT * FROM variables_plantilla WHERE variableid IN (${placeholders}) AND activo = 1`,
        variables_requeridas
      );
      variablesArray = variables;
    }

    // Validar que el HTML contenga las variables requeridas
    const validacion = validarVariablesPlantilla(html_content, variablesArray);
    if (!validacion.valida) {
      return res.status(400).json({
        error: "La plantilla no contiene todas las variables requeridas",
        variables_faltantes: validacion.faltantes
      });
    }

    // Insertar plantilla
    const [result] = await db.execute(
      `INSERT INTO plantillas_tarjetas 
       (nombre, slug, descripcion, html_content, css_content, preview_image, 
        categoriaid, usa_bootstrap, usa_bootstrap_icons, bootstrap_version, 
        usuarioid, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre, slug, descripcion || null, html_content, css_content || null,
        preview_image || null, categoriaid || null,
        usa_bootstrap !== undefined ? usa_bootstrap : 1,
        usa_bootstrap_icons || 0,
        bootstrap_version || '5.3',
        req.user.usuarioid
      ]
    );

    const plantillaid = result.insertId;

    // Asociar variables requeridas
    if (variablesArray.length > 0) {
      const values = variablesArray.map(v => [plantillaid, v.variableid, 1]);
      await db.query(
        "INSERT INTO plantillas_variables (plantillaid, variableid, es_requerida) VALUES ?",
        [values]
      );
    }

    return res.status(201).json({
      message: "Plantilla creada exitosamente",
      plantillaid,
      slug
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al crear plantilla"
    });
  }
};

// Obtener todas las plantillas (público)
exports.getPlantillas = async (req, res) => {
  try {
    const { categoriaid, activo = 1 } = req.query;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre,
             (SELECT COUNT(*) FROM plantillas_variables WHERE plantillaid = p.plantillaid) as total_variables
      FROM plantillas_tarjetas p
      LEFT JOIN categorias c ON p.categoriaid = c.categoriaid
      WHERE p.activo = ?
    `;
    const params = [activo];

    if (categoriaid) {
      query += " AND p.categoriaid = ?";
      params.push(categoriaid);
    }

    query += " ORDER BY p.creado DESC";

    const [plantillas] = await db.execute(query, params);

    return res.json({
      plantillas
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener plantillas"
    });
  }
};

// Obtener plantilla por ID o slug
exports.getPlantillaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT p.*, c.nombre as categoria_nombre,
             (SELECT COUNT(*) FROM plantillas_variables WHERE plantillaid = p.plantillaid) as total_variables
      FROM plantillas_tarjetas p
      LEFT JOIN categorias c ON p.categoriaid = c.categoriaid
      WHERE p.plantillaid = ? OR p.slug = ?
    `;
    
    const [plantillas] = await db.execute(query, [id, id]);

    if (plantillas.length === 0) {
      return res.status(404).json({
        error: "Plantilla no encontrada"
      });
    }

    const plantilla = plantillas[0];

    // Obtener variables requeridas
    const [variables] = await db.execute(
      `SELECT v.*, pv.es_requerida 
       FROM variables_plantilla v
       INNER JOIN plantillas_variables pv ON v.variableid = pv.variableid
       WHERE pv.plantillaid = ? AND v.activo = 1
       ORDER BY v.orden`,
      [plantilla.plantillaid]
    );

    plantilla.variables_requeridas = variables;

    // Incrementar visitas
    await db.execute(
      "UPDATE plantillas_tarjetas SET visitas = visitas + 1 WHERE plantillaid = ?",
      [plantilla.plantillaid]
    );

    return res.json({
      plantilla
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener plantilla"
    });
  }
};

// Actualizar plantilla
exports.updatePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      html_content,
      css_content,
      preview_image,
      categoriaid,
      usa_bootstrap,
      usa_bootstrap_icons,
      bootstrap_version,
      activo,
      variables_requeridas
    } = req.body;

    // Verificar que la plantilla existe
    const [existing] = await db.execute(
      "SELECT * FROM plantillas_tarjetas WHERE plantillaid = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: "Plantilla no encontrada"
      });
    }

    let newSlug = existing[0].slug;
    if (nombre && nombre !== existing[0].nombre) {
      newSlug = slugify(nombre, { lower: true, strict: true });
      
      // Verificar slug único
      const [slugCheck] = await db.execute(
        "SELECT plantillaid FROM plantillas_tarjetas WHERE slug = ? AND plantillaid != ?",
        [newSlug, id]
      );
      
      if (slugCheck.length > 0) {
        return res.status(400).json({
          error: "Ya existe una plantilla con ese nombre"
        });
      }
    }

    // Validar variables si se actualiza el HTML
    if (html_content && variables_requeridas && Array.isArray(variables_requeridas)) {
      const placeholders = variables_requeridas.map(() => '?').join(',');
      const [variables] = await db.execute(
        `SELECT * FROM variables_plantilla WHERE variableid IN (${placeholders}) AND activo = 1`,
        variables_requeridas
      );

      const validacion = validarVariablesPlantilla(html_content, variables);
      if (!validacion.valida) {
        return res.status(400).json({
          error: "La plantilla no contiene todas las variables requeridas",
          variables_faltantes: validacion.faltantes
        });
      }
    }

    // Actualizar plantilla
    await db.execute(
      `UPDATE plantillas_tarjetas SET
        nombre = COALESCE(?, nombre),
        slug = COALESCE(?, slug),
        descripcion = COALESCE(?, descripcion),
        html_content = COALESCE(?, html_content),
        css_content = COALESCE(?, css_content),
        preview_image = COALESCE(?, preview_image),
        categoriaid = COALESCE(?, categoriaid),
        usa_bootstrap = COALESCE(?, usa_bootstrap),
        usa_bootstrap_icons = COALESCE(?, usa_bootstrap_icons),
        bootstrap_version = COALESCE(?, bootstrap_version),
        activo = COALESCE(?, activo),
        actualizado = NOW()
      WHERE plantillaid = ?`,
      [
        nombre, newSlug !== existing[0].slug ? newSlug : null,
        descripcion, html_content, css_content, preview_image,
        categoriaid, usa_bootstrap, usa_bootstrap_icons, bootstrap_version,
        activo, id
      ]
    );

    // Actualizar variables requeridas
    if (variables_requeridas && Array.isArray(variables_requeridas)) {
      // Eliminar asociaciones actuales
      await db.execute(
        "DELETE FROM plantillas_variables WHERE plantillaid = ?",
        [id]
      );

      // Insertar nuevas asociaciones
      if (variables_requeridas.length > 0) {
        const values = variables_requeridas.map(v => [id, v, 1]);
        await db.query(
          "INSERT INTO plantillas_variables (plantillaid, variableid, es_requerida) VALUES ?",
          [values]
        );
      }
    }

    return res.json({
      message: "Plantilla actualizada exitosamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al actualizar plantilla"
    });
  }
};

// Eliminar plantilla (soft delete)
exports.deletePlantilla = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE plantillas_tarjetas SET activo = 0 WHERE plantillaid = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Plantilla no encontrada"
      });
    }

    return res.json({
      message: "Plantilla eliminada exitosamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al eliminar plantilla"
    });
  }
};

// Obtener preview de plantilla con variables reemplazadas
exports.previewPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { datos } = req.body;

    const [plantillas] = await db.execute(
      "SELECT * FROM plantillas_tarjetas WHERE plantillaid = ? AND activo = 1",
      [id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({
        error: "Plantilla no encontrada"
      });
    }

    const plantilla = plantillas[0];
    let htmlPreview = plantilla.html_content;

    // Obtener variables requeridas
    const [variables] = await db.execute(
      `SELECT v.* FROM variables_plantilla v
       INNER JOIN plantillas_variables pv ON v.variableid = pv.variableid
       WHERE pv.plantillaid = ? AND v.activo = 1`,
      [id]
    );

    // Reemplazar variables en el HTML
    variables.forEach(variable => {
      const patron = new RegExp(`\\$_${variable.nombre}_\\$`, 'g');
      const valor = datos && datos[variable.nombre] ? datos[variable.nombre] : `[${variable.etiqueta}]`;
      htmlPreview = htmlPreview.replace(patron, valor);
    });

    return res.json({
      html_preview: htmlPreview,
      css_preview: plantilla.css_content,
      usa_bootstrap: plantilla.usa_bootstrap,
      usa_bootstrap_icons: plantilla.usa_bootstrap_icons,
      bootstrap_version: plantilla.bootstrap_version
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al generar preview"
    });
  }
};