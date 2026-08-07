const SolicitudEdicion = require('../models/SolicitudEdicion');

/**
 * Los admins pueden editar siempre. Un usuario normal solo puede editar un
 * registro puntual si tiene una SolicitudEdicion aprobada para ese registro;
 * al usarla se consume (no sirve para una segunda edicion).
 */
function requireEditApproval(tabla) {
  return async (req, res, next) => {
    if (req.user?.role === 'admin') {
      return next();
    }

    try {
      const solicitud = await SolicitudEdicion.findAprobadaPendiente(req.user.id, tabla, req.params.id);
      if (!solicitud) {
        return res.status(403).json({
          error: 'Necesitás pedirle acceso a un admin para editar este registro',
        });
      }
      await SolicitudEdicion.marcarCompletada(solicitud.id);
      next();
    } catch (err) {
      res.status(500).json({ error: 'Error al verificar el permiso de edición' });
    }
  };
}

module.exports = { requireEditApproval };
