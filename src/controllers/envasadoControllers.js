const client = require('../config/db');

// Obtener todos los envasados
exports.getAllEnvasados = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Envasado');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los envasados' });
  }
};

// Obtener un envasado por ID
exports.getEnvasadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM Envasado WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el envasado' });
  }
};

// Crear un nuevo envasado
exports.createEnvasado = async (req, res) => {
  const { loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, observaciones } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Envasado (loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, observaciones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, observaciones]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el envasado' });
  }
};

// Actualizar un envasado
exports.updateEnvasado = async (req, res) => {
  const { id } = req.params;
  const { loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, observaciones } = req.body;
  try {
    const result = await client.query(
      'UPDATE Envasado SET loteProd = $1, loteEnvasado = $2, producto = $3, cantEnvases = $4, cantDescarte = $5, observaciones = $6 WHERE id = $7 RETURNING *',
      [loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, observaciones, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el envasado' });
  }
};

// Eliminar un envasado
exports.deleteEnvasado = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM Envasado WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Envasado no encontrado' });
    }
    res.json({ message: 'Envasado eliminado correctamente', envasado: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el envasado' });
  }
};
