const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionControllers');

// Rutas para recepción
router.get('/', recepcionController.getAllRecepciones);
router.get('/:id', recepcionController.getRecepcionById);
router.post('/', recepcionController.createRecepcion);
router.put('/:id', recepcionController.updateRecepcion);
router.delete('/:id', recepcionController.deleteRecepcion);

module.exports = router; 