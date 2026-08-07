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

/**
 * Notifica la edicion exitosa de un registro: a quien lo edito
 * (confirmacion) y a todos los admins (quien y que registro editaron),
 * sin romper la edicion si algo falla aca.
 */
async function notificarRegistroEditado({ tabla, codigo, editor_id, editor_nombre }) {
  try {
    const nombreForm = NOMBRES_TABLA[tabla] || tabla;
    const tareas = [];

    if (editor_id) {
      tareas.push(
        Notificacion.create({
          usuario_id: editor_id,
          tipo: 'registro_editado',
          mensaje: `Editaste y se guardó correctamente el registro de ${nombreForm}: ${codigo}`,
          tabla,
          codigo,
        })
      );
    }

    const admins = await User.findAdmins();
    admins
      .filter((admin) => admin.id !== editor_id)
      .forEach((admin) => {
        tareas.push(
          Notificacion.create({
            usuario_id: admin.id,
            tipo: 'registro_editado_admin',
            mensaje: `${editor_nombre || 'Un usuario'} editó el registro de ${nombreForm}: ${codigo}`,
            tabla,
            codigo,
          })
        );
      });

    await Promise.all(tareas);
  } catch (error) {
    console.error('[notificaciones] error al notificar registro editado:', error.message);
  }
}

module.exports = { notificarRegistroCreado, notificarRegistroEditado, NOMBRES_TABLA };
