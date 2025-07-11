const pool = require('../config/db');

// Obtener todos los expendios
exports.getAllExpendios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Expendio');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los expendios' });
  }
};

// Obtener un expendio por ID
exports.getExpendioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Expendio WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el expendio' });
  }
};

// Crear un nuevo expendio
exports.createExpendio = async (req, res) => {
  const { producto, lote, destino, tempTransporte, LimpTransporte, responsable } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Expendio (producto, lote, destino, tempTransporte, LimpTransporte, responsable) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [producto, lote, destino, tempTransporte, LimpTransporte, responsable]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el expendio' });
  }
};

// Actualizar un expendio
exports.updateExpendio = async (req, res) => {
  const { id } = req.params;
  const { producto, lote, destino, tempTransporte, LimpTransporte, responsable } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Expendio SET producto = $1, lote = $2, destino = $3, tempTransporte = $4, LimpTransporte = $5, responsable = $6 WHERE id = $7 RETURNING *',
      [producto, lote, destino, tempTransporte, LimpTransporte, responsable, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el expendio' });
  }
};

// Eliminar un expendio
exports.deleteExpendio = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Expendio WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expendio no encontrado' });
    }
    res.json({ message: 'Expendio eliminado correctamente', expendio: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el expendio' });
  }
}; 