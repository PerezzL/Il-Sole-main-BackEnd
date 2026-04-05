const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionControllers');
const { authenticateToken } = require('../middleware/auth');

// Rutas para producción (todas requieren autenticación para rastrear responsable)
router.get('/', authenticateToken, produccionController.getAllProducciones);
router.get('/:id', authenticateToken, produccionController.getProduccionById);
router.post('/', authenticateToken, produccionController.createProduccion);
router.put('/:id', authenticateToken, produccionController.updateProduccion);
router.delete('/:id', authenticateToken, produccionController.deleteProduccion);

module.exports = router;
