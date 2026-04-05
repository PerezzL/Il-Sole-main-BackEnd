const express = require('express');
const router = express.Router();
const materiaPrimaController = require('../controllers/materiaPrimaControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, materiaPrimaController.getAllMateriasPrimas);
router.get('/active', authenticateToken, materiaPrimaController.getActiveMateriasPrimas);
router.get('/search', authenticateToken, materiaPrimaController.searchMateriasPrimas);
router.get('/categoria/:categoria', authenticateToken, materiaPrimaController.getMateriasPrimasByCategoria);
router.get('/:id', authenticateToken, materiaPrimaController.getMateriaPrimaById);
router.post('/', authenticateToken, requireAdmin, materiaPrimaController.createMateriaPrima);
router.put('/:id', authenticateToken, requireAdmin, materiaPrimaController.updateMateriaPrima);
router.delete('/:id', authenticateToken, requireAdmin, materiaPrimaController.deleteMateriaPrima);

module.exports = router;
