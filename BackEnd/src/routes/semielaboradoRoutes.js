const express = require('express');
const router = express.Router();
const semielaboradoController = require('../controllers/semielaboradoControllers');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { requireEditApproval } = require('../middleware/editApproval');

// Lectura: usuario autenticado; alta/baja: solo admin. Edición: admin o
// usuario con una solicitud de edición aprobada para ese registro puntual.
router.get('/', authenticateToken, semielaboradoController.getAllSemielaborados);
router.get('/dropdown/nombres', authenticateToken, semielaboradoController.getSemielaboradosNombres);
router.get('/:id', authenticateToken, semielaboradoController.getSemielaboradoById);
router.post('/', authenticateToken, requireAdmin, semielaboradoController.createSemielaborado);
router.put('/:id', authenticateToken, requireEditApproval('Semielaborado'), semielaboradoController.updateSemielaborado);
router.delete('/:id', authenticateToken, requireAdmin, semielaboradoController.deleteSemielaborado);

module.exports = router;
