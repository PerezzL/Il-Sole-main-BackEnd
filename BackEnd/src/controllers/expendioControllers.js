const pool = require('../config/db');
const Expendio = require('../models/Expendio');
const { notificarRegistroEditado } = require('../utils/notificaciones');

exports.getAllExpendios = async (req, res) => {
  try {
    const expendios = await Expendio.findAll();
    res.json(expendios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los expendios', details: err.message });
  }
};

// Obtener un expendio por ID
exports.getExpendioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Expendio" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el expendio' });
  }
};

// Crear un nuevo expendio
exports.createExpendio = async (req, res) => {
  const { producto, lote, destino, tempTransporte, LimpTransporte, responsable } = req.body;
  try {
    // Obtener información del usuario autenticado (sobrescribe el responsable del formulario)
    const responsableAuth = req.user?.username || req.user?.name || 'Usuario desconocido';
    const usuario_id = req.user?.id;    
    const expendio = await Expendio.create({
      producto,
      lote,
      destino,
      tempTransporte,
      LimpTransporte,
      responsable: responsableAuth, // Usar el usuario autenticado como responsable
      usuario_id
    });    
    res.status(201).json(expendio);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el expendio', details: err.message });
  }
};

// Actualizar un expendio
exports.updateExpendio = async (req, res) => {
  const { id } = req.params;
  const { producto, lote, destino, tempTransporte, LimpTransporte } = req.body;
  try {
    const campos = [];
    const valores = [];
    let i = 1;

    if (producto !== undefined) { campos.push(`producto = $${i++}`); valores.push(producto); }
    if (lote !== undefined) { campos.push(`lote = $${i++}`); valores.push(lote); }
    if (destino !== undefined) { campos.push(`destino = $${i++}`); valores.push(destino); }
    if (tempTransporte !== undefined) { campos.push(`tempTransporte = $${i++}`); valores.push(tempTransporte); }
    if (LimpTransporte !== undefined) { campos.push(`LimpTransporte = $${i++}`); valores.push(LimpTransporte); }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' });
    }

    valores.push(id);
    const result = await pool.query(
      `UPDATE "Expendio" SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
      valores
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    const expendio = result.rows[0];
    await notificarRegistroEditado({
      tabla: 'Expendio',
      codigo: expendio.codigo,
      editor_id: req.user?.id,
      editor_nombre: req.user?.username,
    });
    res.json(expendio);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el expendio' });
  }
};

// Eliminar un expendio
exports.deleteExpendio = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM "Expendio" WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    res.json({ message: 'Expendio eliminado correctamente', expendio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el expendio' });
  }
};