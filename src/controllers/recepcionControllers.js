const client = require('../config/db');

// Obtener todas las recepciones
exports.getAllRecepciones = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Recepcion');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las recepciones' });
  }
};

// Obtener una recepción por ID
exports.getRecepcionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM Recepcion WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la recepción' });
  }
};

// Crear una nueva recepción
exports.createRecepcion = async (req, res) => {
  const { materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Recepcion (materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la recepción' });
  }
};

// Actualizar una recepción
exports.updateRecepcion = async (req, res) => {
  const { id } = req.params;
  const { materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote } = req.body;
  try {
    const result = await client.query(
      'UPDATE Recepcion SET materiaPrima = $1, control1 = $2, control2 = $3, control3 = $4, marca = $5, proveedor = $6, cant = $7, nroRemito = $8, temp = $9, fechaElaborado = $10, fechaVTO = $11, lote = $12 WHERE id = $13 RETURNING *',
      [materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la recepción' });
  }
};

// Eliminar una recepción
exports.deleteRecepcion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM Recepcion WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }
    res.json({ message: 'Recepción eliminada correctamente', recepcion: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la recepción' });
  }
}; 