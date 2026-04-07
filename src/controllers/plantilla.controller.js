const db = require("../config/db");
const { getMexicoISO } = require("../utils/date.utils");
const slugify = require("slugify");

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
      variables_requeridas
    } = req.body;

    if (!nombre || !html_content) {
      return res.status(400).json({
        error: "Nombre y contenido HTML son requeridos"
      });
    }

    const slug = slugify(nombre, { lower: true, strict: true });
    
    const [existing] = await db.execute(
      "SELECT plantillaid FROM plantillas_tarjetas WHERE slug = ?",
      [slug]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        error: "Ya existe una plantilla con ese nombre"
      });
    }

    let variablesArray = [];
    if (variables_requeridas && Array.isArray(variables_requeridas) && variables_requeridas.length > 0) {
      const placeholders = variables_requeridas.map(() => '?').join(',');
      const [variables] = await db.execute(
        `SELECT * FROM variables_plantilla WHERE variableid IN (${placeholders}) AND activo = 1`,
        variables_requeridas
      );
      variablesArray = variables;
    }

    if (variablesArray.length > 0) {
      const validacion = validarVariablesPlantilla(html_content, variablesArray);
      if (!validacion.valida) {
        return res.status(400).json({
          error: "La plantilla no contiene todas las variables requeridas",
          variables_faltantes: validacion.faltantes
        });
      }
    }

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

    const [variables] = await db.execute(
      `SELECT v.*, pv.es_requerida 
       FROM variables_plantilla v
       INNER JOIN plantillas_variables pv ON v.variableid = pv.variableid
       WHERE pv.plantillaid = ? AND v.activo = 1
       ORDER BY v.orden`,
      [plantilla.plantillaid]
    );

    plantilla.variables_requeridas = variables;

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

    if (html_content && variables_requeridas && Array.isArray(variables_requeridas) && variables_requeridas.length > 0) {
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

    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (newSlug !== existing[0].slug) {
      updates.push("slug = ?");
      values.push(newSlug);
    }
    if (descripcion !== undefined) {
      updates.push("descripcion = ?");
      values.push(descripcion);
    }
    if (html_content !== undefined) {
      updates.push("html_content = ?");
      values.push(html_content);
    }
    if (css_content !== undefined) {
      updates.push("css_content = ?");
      values.push(css_content);
    }
    if (preview_image !== undefined) {
      updates.push("preview_image = ?");
      values.push(preview_image);
    }
    if (categoriaid !== undefined) {
      updates.push("categoriaid = ?");
      values.push(categoriaid === '' ? null : categoriaid);
    }
    if (usa_bootstrap !== undefined) {
      updates.push("usa_bootstrap = ?");
      values.push(usa_bootstrap);
    }
    if (usa_bootstrap_icons !== undefined) {
      updates.push("usa_bootstrap_icons = ?");
      values.push(usa_bootstrap_icons);
    }
    if (bootstrap_version !== undefined) {
      updates.push("bootstrap_version = ?");
      values.push(bootstrap_version);
    }
    if (activo !== undefined) {
      updates.push("activo = ?");
      values.push(activo);
    }

    if (updates.length > 0) {
      updates.push("actualizado = NOW()");
      const query = `UPDATE plantillas_tarjetas SET ${updates.join(', ')} WHERE plantillaid = ?`;
      values.push(id);
      
      await db.execute(query, values);
    }

    if (variables_requeridas && Array.isArray(variables_requeridas)) {
      await db.execute(
        "DELETE FROM plantillas_variables WHERE plantillaid = ?",
        [id]
      );

      if (variables_requeridas.length > 0) {
        const values = variables_requeridas.map(v => [parseInt(id), parseInt(v), 1]);
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

    const [variables] = await db.execute(
      `SELECT v.* FROM variables_plantilla v
       INNER JOIN plantillas_variables pv ON v.variableid = pv.variableid
       WHERE pv.plantillaid = ? AND v.activo = 1`,
      [id]
    );

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