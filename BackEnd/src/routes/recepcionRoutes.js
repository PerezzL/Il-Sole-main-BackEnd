const express = require('express');
const router = express.Router();
const recepcionController = require('../controllers/recepcionControllers');
const { authenticateToken } = require('../middleware/auth');
const { isProd } = require('../config/secrets');

router.get('/', authenticateToken, recepcionController.getAllRecepciones);
if (!isProd) {
  router.get('/test-structure', authenticateToken, recepcionController.testRecepcionStructure);
}
router.get('/:id', authenticateToken, recepcionController.getRecepcionById);
router.post('/', authenticateToken, recepcionController.createRecepcion);
router.put('/:id', authenticateToken, recepcionController.updateRecepcion);
router.delete('/:id', authenticateToken, recepcionController.deleteRecepcion);

module.exports = router; 