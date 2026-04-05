const express = require('express');
const router = express.Router();
const TrazabilidadController = require('../controllers/trazabilidadController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * ========================================================================
 * RUTA PRINCIPAL: Trazabilidad por lote de producción
 * ========================================================================
 * @route   GET /api/trazabilidad/lote/:loteProduccion
 * @desc    Obtener trazabilidad completa a partir de un lote de producción
 * @access  Private
 * @params  loteProduccion: El lote de producción a rastrear
 * 
 * FLUJO DE TRAZABILIDAD:
 * EXPENDIO → ENVASADO → PRODUCCIÓN → PESADO → RECEPCIÓN
 */
router.get('/lote/:loteProduccion', TrazabilidadController.getByLoteProduccion);

/**
 * @route   GET /api/trazabilidad/:tipo/:id
 * @desc    Obtener trazabilidad completa de un registro
 * @access  Private
 * @params  tipo: expendio|envasado|produccion|pesado|recepcion
 *          id: ID del registro
 */
router.get('/:tipo/:id', TrazabilidadController.getTrace);

/**
 * @route   GET /api/trazabilidad/buscar/:lote
 * @desc    Buscar registros por lote en todas las tablas
 * @access  Private
 * @params  lote: Número de lote a buscar
 */
router.get('/buscar/:lote', TrazabilidadController.searchByLote);

/**
 * @route   GET /api/trazabilidad/verificar/:tipo/:id
 * @desc    Verificar integridad de trazabilidad
 * @access  Private
 * @params  tipo: tipo de tabla
 *          id: ID del registro
 */
router.get('/verificar/:tipo/:id', TrazabilidadController.verifyIntegrity);

/**
 * @route   GET /api/trazabilidad/export/pdf/:tipo/:id
 * @desc    Exportar trazabilidad a PDF
 * @access  Private
 * @params  tipo: tipo de tabla
 *          id: ID del registro
 */
router.get('/export/pdf/:tipo/:id', TrazabilidadController.exportToPDF);

module.exports = router;
