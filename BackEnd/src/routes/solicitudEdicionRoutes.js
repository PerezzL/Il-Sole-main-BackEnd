const express = require('express');
const router = express.Router();
const solicitudEdicionController = require('../controllers/solicitudEdicionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, solicitudEdicionController.crearSolicitud);
router.get('/mias', authenticateToken, solicitudEdicionController.getMisSolicitudes);
router.get('/pendientes', authenticateToken, requireAdmin, solicitudEdicionController.getPendientes);
router.put('/:id/aprobar', authenticateToken, requireAdmin, solicitudEdicionController.aprobar);
router.put('/:id/rechazar', authenticateToken, requireAdmin, solicitudEdicionController.rechazar);

module.exports = router;
