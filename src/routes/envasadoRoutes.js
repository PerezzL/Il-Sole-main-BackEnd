const express = require('express');
const router = express.Router();
const envasadoController = require('../controllers/envasadoControllers');

// Rutas para envasado
router.get('/', envasadoController.getAllEnvasados);
router.get('/:id', envasadoController.getEnvasadoById);
router.post('/', envasadoController.createEnvasado);
router.put('/:id', envasadoController.updateEnvasado);
router.delete('/:id', envasadoController.deleteEnvasado);

module.exports = router;
