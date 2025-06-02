const express = require('express');
const router = express.Router();
const controlPesadoController = require('../controllers/controlPesadoControllers');

// Rutas para control de pesado
router.get('/', controlPesadoController.getAllPesados);
router.get('/:id', controlPesadoController.getPesadoById);
router.post('/', controlPesadoController.createPesado);
router.put('/:id', controlPesadoController.updatePesado);
router.delete('/:id', controlPesadoController.deletePesado);

module.exports = router;
