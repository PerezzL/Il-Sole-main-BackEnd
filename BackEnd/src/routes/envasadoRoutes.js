const express = require('express');
const router = express.Router();
const envasadoController = require('../controllers/envasadoControllers');
const { authenticateToken } = require('../middleware/auth');

// Rutas para envasado (todas requieren autenticación para rastrear responsable)
router.get('/', authenticateToken, envasadoController.getAllEnvasados);
router.get('/:id', authenticateToken, envasadoController.getEnvasadoById);
router.post('/', authenticateToken, envasadoController.createEnvasado);
router.put('/:id', authenticateToken, envasadoController.updateEnvasado);
router.delete('/:id', authenticateToken, envasadoController.deleteEnvasado);

module.exports = router;
