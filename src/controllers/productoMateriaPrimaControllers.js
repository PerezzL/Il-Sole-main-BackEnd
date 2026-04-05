const ProductoMateriaPrima = require('../models/ProductoMateriaPrima');

// Obtener todas las relaciones producto-materia prima
const getAllProductoMateriaPrima = async (req, res) => {
  try {
    const relaciones = await ProductoMateriaPrima.findAll();
    res.json(relaciones);
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener materias primas de un producto específico
const getMateriasPrimasByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const materiasPrimas = await ProductoMateriaPrima.findByProductoId(productoId);
    res.json(materiasPrimas);
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productos que usan una materia prima específica
const getProductosByMateriaPrima = async (req, res) => {
  try {
    const { materiaPrimaId } = req.params;
    const productos = await ProductoMateriaPrima.findByMateriaPrimaId(materiaPrimaId);
    res.json(productos);
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear relación con auto-creación de productos y materias primas
const createProductoMateriaPrima = async (req, res) => {
  try {
    const {
      producto_nombre,
      materia_prima_nombre
    } = req.body;

    // Validaciones básicas
    if (!producto_nombre || !materia_prima_nombre) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: producto_nombre, materia_prima_nombre'
      });
    }

    const relacion = await ProductoMateriaPrima.createWithAutoCreation({
      producto_nombre,
      materia_prima_nombre
    });

    res.status(201).json({
      message: 'Relación creada exitosamente',
      data: relacion
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear múltiples relaciones para un producto
const createMultipleForProduct = async (req, res) => {
  try {
    const { producto, materias_primas } = req.body;

    // Validaciones básicas
    if (!producto || !producto.nombre || !materias_primas || !Array.isArray(materias_primas)) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: producto (con nombre) y materias_primas (array)'
      });
    }

    // Validar que cada materia prima tenga los campos requeridos
    for (const materiaPrima of materias_primas) {
      if (!materiaPrima.nombre) {
        return res.status(400).json({
          error: 'Cada materia prima debe tener nombre'
        });
      }
    }

    const relaciones = await ProductoMateriaPrima.createMultipleForProduct(producto, materias_primas);

    res.status(201).json({
      message: 'Relaciones creadas exitosamente',
      data: relaciones
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar relación
const updateProductoMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const relacion = await ProductoMateriaPrima.update(id, {
      activo
    });

    if (!relacion) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }

    res.json({
      message: 'Relación actualizada exitosamente',
      data: relacion
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar relación (soft delete)
const deleteProductoMateriaPrima = async (req, res) => {
  try {
    const { id } = req.params;
    const relacion = await ProductoMateriaPrima.delete(id);

    if (!relacion) {
      return res.status(404).json({ error: 'Relación no encontrada' });
    }

    res.json({
      message: 'Relación eliminada exitosamente',
      data: relacion
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener receta completa de un producto
const getReceta = async (req, res) => {
  try {
    const { productoId } = req.params;
    const receta = await ProductoMateriaPrima.getReceta(productoId);

    if (!receta) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(receta);
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar producto y sus materias primas
const updateProductoCompleto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { 
      producto_nombre, 
      materias_primas 
    } = req.body;

    // Validaciones básicas
    if (!producto_nombre) {
      return res.status(400).json({
        error: 'El nombre del producto es requerido'
      });
    }

    if (!materias_primas || !Array.isArray(materias_primas)) {
      return res.status(400).json({
        error: 'Las materias primas deben ser un array'
      });
    }

    const resultado = await ProductoMateriaPrima.updateProductoCompleto(
      productoId, 
      producto_nombre, 
      materias_primas
    );

    res.json({
      message: 'Producto actualizado exitosamente',
      data: resultado
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar materia prima a un producto existente
const agregarMateriaPrimaAProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { materia_prima_nombre } = req.body;

    if (!materia_prima_nombre) {
      return res.status(400).json({
        error: 'El nombre de la materia prima es requerido'
      });
    }

    const resultado = await ProductoMateriaPrima.agregarMateriaPrimaAProducto(
      productoId,
      materia_prima_nombre
    );

    res.status(201).json({
      message: 'Materia prima agregada exitosamente',
      data: resultado
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar materia prima de un producto
const eliminarMateriaPrimaDeProducto = async (req, res) => {
  try {
    const { productoId, materiaPrimaId } = req.params;

    const resultado = await ProductoMateriaPrima.eliminarMateriaPrimaDeProducto(
      productoId,
      materiaPrimaId
    );

    res.json({
      message: 'Materia prima eliminada exitosamente',
      data: resultado
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los productos con sus materias primas
const getAllProductosConMateriasPrimas = async (req, res) => {
  try {
    const productos = await ProductoMateriaPrima.getAllProductosConMateriasPrimas();
    res.json(productos);
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar producto completo (producto y todas sus relaciones)
const deleteProductoCompleto = async (req, res) => {
  try {
    const { productoId } = req.params;

    const resultado = await ProductoMateriaPrima.deleteProductoCompleto(productoId);

    res.json({
      message: 'Producto eliminado exitosamente',
      data: resultado
    });
  } catch (error) {    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllProductoMateriaPrima,
  getMateriasPrimasByProducto,
  getProductosByMateriaPrima,
  createProductoMateriaPrima,
  createMultipleForProduct,
  updateProductoMateriaPrima,
  deleteProductoMateriaPrima,
  getReceta,
  updateProductoCompleto,
  agregarMateriaPrimaAProducto,
  eliminarMateriaPrimaDeProducto,
  getAllProductosConMateriasPrimas,
  deleteProductoCompleto
}; 