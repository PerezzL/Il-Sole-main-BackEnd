const Notificacion = require('../models/Notificacion');
const User = require('../models/User');

const NOMBRES_TABLA = {
  Recepcion: 'Recepción',
  Produccion: 'Producción',
  Envasado: 'Envasado',
  ControlPesado: 'Control Pesado',
  Expendio: 'Expendio',
  Semielaborado: 'Semielaborado',
};

/**
 * Notifica la carga exitosa de un registro: al usuario que lo cargo
 * (confirmacion) y a todos los admins (quien y que cargo), sin romper
 * el alta del registro si algo falla aca.
 */
async function notificarRegistroCreado({ tabla, codigo, usuario_id, responsable }) {
  try {
    const nombreForm = NOMBRES_TABLA[tabla] || tabla;
    const tareas = [];

    if (usuario_id) {
      tareas.push(
        Notificacion.create({
          usuario_id,
          tipo: 'registro_creado',
          mensaje: `Se cargó correctamente el registro de ${nombreForm}: ${codigo}`,
          tabla,
          codigo,
        })
      );
    }

    const admins = await User.findAdmins();
    admins
      .filter((admin) => admin.id !== usuario_id)
      .forEach((admin) => {
        tareas.push(
          Notificacion.create({
            usuario_id: admin.id,
            tipo: 'registro_creado_admin',
            mensaje: `${responsable || 'Un usuario'} cargó un registro de ${nombreForm}: ${codigo}`,
            tabla,
            codigo,
          })
        );
      });

    await Promise.all(tareas);
  } catch (error) {
    console.error('[notificaciones] error al notificar registro creado:', error.message);
  }
}

module.exports = { notificarRegistroCreado };
