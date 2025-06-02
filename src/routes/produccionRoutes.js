const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionControllers');

// Rutas para producción
router.get('/', produccionController.getAllProducciones);
router.get('/:id', produccionController.getProduccionById);
router.post('/', produccionController.createProduccion);
router.put('/:id', produccionController.updateProduccion);
router.delete('/:id', produccionController.deleteProduccion);

module.exports = router;
