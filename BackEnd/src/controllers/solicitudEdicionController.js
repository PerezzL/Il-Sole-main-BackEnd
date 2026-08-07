const SolicitudEdicion = require('../models/SolicitudEdicion');
const Notificacion = require('../models/Notificacion');
const User = require('../models/User');
const { NOMBRES_TABLA } = require('../utils/notificaciones');

exports.crearSolicitud = async (req, res) => {
  const { tabla, registro_id, codigo } = req.body;
  if (!tabla || !registro_id) {
    return res.status(400).json({ error: 'tabla y registro_id son requeridos' });
  }

  try {
    const solicitud = await SolicitudEdicion.create({
      tabla,
      registro_id,
      codigo,
      usuario_id: req.user.id,
      usuario_nombre: req.user.username,
    });

    const nombreForm = NOMBRES_TABLA[tabla] || tabla;
    const referencia = codigo || `#${registro_id}`;

    const admins = await User.findAdmins();
    await Promise.all(
      admins.map((admin) =>
        Notificacion.create({
          usuario_id: admin.id,
          tipo: 'solicitud_edicion_creada',
          mensaje: `${req.user.username} pidió editar el registro de ${nombreForm}: ${referencia}`,
          tabla,
          codigo,
        })
      )
    );

    await Notificacion.create({
      usuario_id: req.user.id,
      tipo: 'solicitud_edicion_enviada',
      mensaje: `Pedido de edición enviado para el registro de ${nombreForm}: ${referencia}. Esperá la aprobación de un admin.`,
      tabla,
      codigo,
    });

    res.status(201).json(solicitud);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la solicitud de edición', details: err.message });
  }
};

exports.getMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudEdicion.findByUsuario(req.user.id);
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las solicitudes', details: err.message });
  }
};

exports.getPendientes = async (req, res) => {
  try {
    const solicitudes = await SolicitudEdicion.findPendientes();
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las solicitudes pendientes', details: err.message });
  }
};

exports.aprobar = async (req, res) => {
  const { id } = req.params;
  try {
    const solicitud = await SolicitudEdicion.findById(id);
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const actualizada = await SolicitudEdicion.marcarEstado(id, 'aprobada', req.user.id);

    const nombreForm = NOMBRES_TABLA[solicitud.tabla] || solicitud.tabla;
    const referencia = solicitud.codigo || `#${solicitud.registro_id}`;
    await Notificacion.create({
      usuario_id: solicitud.usuario_id,
      tipo: 'solicitud_edicion_aprobada',
      mensaje: `Ya podés editar el registro de ${nombreForm}: ${referencia}`,
      tabla: solicitud.tabla,
      codigo: solicitud.codigo,
    });

    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ error: 'Error al aprobar la solicitud', details: err.message });
  }
};

exports.rechazar = async (req, res) => {
  const { id } = req.params;
  try {
    const solicitud = await SolicitudEdicion.findById(id);
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const actualizada = await SolicitudEdicion.marcarEstado(id, 'rechazada', req.user.id);

    const nombreForm = NOMBRES_TABLA[solicitud.tabla] || solicitud.tabla;
    const referencia = solicitud.codigo || `#${solicitud.registro_id}`;
    await Notificacion.create({
      usuario_id: solicitud.usuario_id,
      tipo: 'solicitud_edicion_rechazada',
      mensaje: `Tu pedido de edición para el registro de ${nombreForm}: ${referencia} fue rechazado`,
      tabla: solicitud.tabla,
      codigo: solicitud.codigo,
    });

    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ error: 'Error al rechazar la solicitud', details: err.message });
  }
};
