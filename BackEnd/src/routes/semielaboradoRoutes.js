const express = require('express');
const router = express.Router();
const semielaboradoController = require('../controllers/semielaboradoControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Lectura: usuario autenticado; alta/edición/baja: solo admin (catálogo sensible)
router.get('/', authenticateToken, semielaboradoController.getAllSemielaborados);
router.get('/:id', authenticateToken, semielaboradoController.getSemielaboradoById);
router.post('/', authenticateToken, requireAdmin, semielaboradoController.createSemielaborado);
router.put('/:id', authenticateToken, requireAdmin, semielaboradoController.updateSemielaborado);
router.delete('/:id', authenticateToken, requireAdmin, semielaboradoController.deleteSemielaborado);

module.exports = router;
