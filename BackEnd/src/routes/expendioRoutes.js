const express = require('express');
const router = express.Router();
const expendioController = require('../controllers/expendioControllers');
const { authenticateToken } = require('../middleware/auth');
const { requireEditApproval } = require('../middleware/editApproval');

// Rutas para expendio (todas requieren autenticación para rastrear responsable)
router.get('/', authenticateToken, expendioController.getAllExpendios);
router.get('/:id', authenticateToken, expendioController.getExpendioById);
router.post('/', authenticateToken, expendioController.createExpendio);
router.put('/:id', authenticateToken, requireEditApproval('Expendio'), expendioController.updateExpendio);
router.delete('/:id', authenticateToken, expendioController.deleteExpendio);

module.exports = router; 