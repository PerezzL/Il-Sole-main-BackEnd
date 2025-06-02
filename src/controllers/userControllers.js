const client = require('../config/db');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM Users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Users (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, password, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol } = req.body;
  try {
    const result = await client.query(
      'UPDATE Users SET nombre = $1, email = $2, password = $3, rol = $4 WHERE id = $5 RETURNING *',
      [nombre, email, password, rol, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM Users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
