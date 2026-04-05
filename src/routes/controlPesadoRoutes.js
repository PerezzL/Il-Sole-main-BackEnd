const express = require('express');
const router = express.Router();
const controlPesadoController = require('../controllers/controlPesadoControllers');
const { authenticateToken } = require('../middleware/auth');

// Rutas para control de pesado (todas requieren autenticación para rastrear responsable)
router.get('/', authenticateToken, controlPesadoController.getAllPesados);
router.get('/:id', authenticateToken, controlPesadoController.getPesadoById);
router.post('/', authenticateToken, controlPesadoController.createPesado);
router.put('/:id', authenticateToken, controlPesadoController.updatePesado);
router.delete('/:id', authenticateToken, controlPesadoController.deletePesado);

module.exports = router;
