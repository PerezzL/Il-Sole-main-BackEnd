const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productoMateriaPrimaControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

// Obtener todas las relaciones producto-materia prima
router.get('/', getAllProductoMateriaPrima);

// Obtener materias primas de un producto específico
router.get('/producto/:productoId', getMateriasPrimasByProducto);

// Obtener productos que usan una materia prima específica
router.get('/materia-prima/:materiaPrimaId', getProductosByMateriaPrima);

// Obtener receta completa de un producto
router.get('/receta/:productoId', getReceta);

// Crear relación con auto-creación de productos y materias primas
router.post('/', createProductoMateriaPrima);

// Crear múltiples relaciones para un producto
router.post('/multiple', createMultipleForProduct);

// Actualizar relación
router.put('/:id', updateProductoMateriaPrima);

// Eliminar relación (soft delete)
router.delete('/:id', deleteProductoMateriaPrima);

// ============================================================================
// RUTAS PARA GESTIÓN COMPLETA DE PRODUCTOS
// ============================================================================

// Obtener todos los productos con sus materias primas
router.get('/productos/completos', getAllProductosConMateriasPrimas);

router.put('/producto/:productoId/completo', requireAdmin, updateProductoCompleto);
router.delete('/producto/:productoId/completo', requireAdmin, deleteProductoCompleto);

// ============================================================================
// RUTAS PARA AGREGAR/ELIMINAR MATERIAS PRIMAS DE PRODUCTOS
// ============================================================================

router.post('/producto/:productoId/materia-prima', requireAdmin, agregarMateriaPrimaAProducto);
router.delete('/producto/:productoId/materia-prima/:materiaPrimaId', requireAdmin, eliminarMateriaPrimaDeProducto);

module.exports = router; 