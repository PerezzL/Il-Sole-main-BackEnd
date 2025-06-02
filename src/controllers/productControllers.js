const client = require('../config/db');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Product');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM Product WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Product (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await client.query(
      'UPDATE Product SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM Product WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente', product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
