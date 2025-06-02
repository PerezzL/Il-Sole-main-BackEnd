const client = require('../config/db');

// Obtener todas las producciones
exports.getAllProducciones = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Produccion');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las producciones' });
  }
};

// Obtener una producción por ID
exports.getProduccionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM Produccion WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la producción' });
  }
};

// Crear una nueva producción
exports.createProduccion = async (req, res) => {
  const { producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Produccion (producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la producción' });
  }
};

// Actualizar una producción
exports.updateProduccion = async (req, res) => {
  const { id } = req.params;
  const { producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios } = req.body;
  try {
    const result = await client.query(
      'UPDATE Produccion SET producto = $1, materiaPrima = $2, lote = $3, planProduccion = $4, produccion = $5, pesoDescarte = $6, observaciones = $7, comentarios = $8 WHERE id = $9 RETURNING *',
      [producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la producción' });
  }
};

// Eliminar una producción
exports.deleteProduccion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM Produccion WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    res.json({ message: 'Producción eliminada correctamente', produccion: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la producción' });
  }
};
