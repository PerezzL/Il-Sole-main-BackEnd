const express = require('express');
const router = express.Router();
const expendioController = require('../controllers/expendioControllers');

// Rutas para expendio
router.get('/', expendioController.getAllExpendios);
router.get('/:id', expendioController.getExpendioById);
router.post('/', expendioController.createExpendio);
router.put('/:id', expendioController.updateExpendio);
router.delete('/:id', expendioController.deleteExpendio);

module.exports = router; 