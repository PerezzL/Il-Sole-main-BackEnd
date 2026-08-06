const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, notificacionController.getMisNotificaciones);
router.get('/no-leidas/count', authenticateToken, notificacionController.getNoLeidasCount);
router.put('/leidas', authenticateToken, notificacionController.marcarTodasLeidas);
router.put('/:id/leido', authenticateToken, notificacionController.marcarLeida);

module.exports = router;
