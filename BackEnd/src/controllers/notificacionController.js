const Notificacion = require('../models/Notificacion');

exports.getMisNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findByUsuario(req.user.id);
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones', details: err.message });
  }
};

exports.getNoLeidasCount = async (req, res) => {
  try {
    const count = await Notificacion.countNoLeidas(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar notificaciones', details: err.message });
  }
};

exports.marcarLeida = async (req, res) => {
  const { id } = req.params;
  try {
    const notificacion = await Notificacion.marcarLeida(id, req.user.id);
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    res.json(notificacion);
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar la notificación', details: err.message });
  }
};

exports.marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.marcarTodasLeidas(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar las notificaciones', details: err.message });
  }
};
