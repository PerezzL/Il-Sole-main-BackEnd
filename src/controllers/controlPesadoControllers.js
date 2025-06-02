const client = require('../config/db');

// Obtener todos los registros de pesado
exports.getAllPesados = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM ControlPesado');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los registros de pesado' });
  }
};

// Obtener un registro de pesado por ID
exports.getPesadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM ControlPesado WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el registro de pesado' });
  }
};

// Crear un nuevo registro de pesado
exports.createPesado = async (req, res) => {
  const { producto, materiaPrima, peso, fecha, observaciones } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO ControlPesado (producto, materiaPrima, peso, fecha, observaciones) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [producto, materiaPrima, peso, fecha, observaciones]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el registro de pesado' });
  }
};

// Actualizar un registro de pesado
exports.updatePesado = async (req, res) => {
  const { id } = req.params;
  const { producto, materiaPrima, peso, fecha, observaciones } = req.body;
  try {
    const result = await client.query(
      'UPDATE ControlPesado SET producto = $1, materiaPrima = $2, peso = $3, fecha = $4, observaciones = $5 WHERE id = $6 RETURNING *',
      [producto, materiaPrima, peso, fecha, observaciones, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el registro de pesado' });
  }
};

// Eliminar un registro de pesado
exports.deletePesado = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM ControlPesado WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro de pesado no encontrado' });
    }
    res.json({ message: 'Registro de pesado eliminado correctamente', pesado: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el registro de pesado' });
  }
};
