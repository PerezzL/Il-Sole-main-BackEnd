const Product = require('../models/Product');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {    const products = await Product.findForDropdown();    res.json(products);
  } catch (err) {    res.status(500).json({ 
      error: 'Error al obtener productos',
      details: err.message,
      code: err.code 
    });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  const { name, description } = req.body;
  try {
    const product = await Product.create({ name, description });
    res.status(201).json(product);
  } catch (err) {    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const productData = {};
    if (name) productData.name = name;
    if (description) productData.description = description;
    
    const product = await Product.update(id, productData);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.delete(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente', product });
  } catch (err) {    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// Buscar productos por nombre
exports.getProductsByName = async (req, res) => {
  const { name } = req.params;
  try {
    const products = await Product.findByName(name);
    res.json(products);
  } catch (err) {    res.status(500).json({ error: 'Error al buscar productos' });
  }
};

// Buscar productos por descripción
exports.getProductsByDescription = async (req, res) => {
  const { description } = req.params;
  try {
    const products = await Product.findByDescription(description);
    res.json(products);
  } catch (err) {    res.status(500).json({ error: 'Error al buscar productos' });
  }
};
