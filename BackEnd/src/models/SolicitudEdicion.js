const pool = require('../config/db');

class SolicitudEdicion {
  static async create({ tabla, registro_id, codigo, usuario_id, usuario_nombre }) {
    const result = await pool.query(
      'INSERT INTO "SolicitudEdicion" (tabla, registro_id, codigo, usuario_id, usuario_nombre) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tabla, registro_id, codigo, usuario_id, usuario_nombre]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "SolicitudEdicion" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUsuario(usuario_id) {
    const result = await pool.query(
      'SELECT * FROM "SolicitudEdicion" WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );
    return result.rows;
  }

  static async findPendientes() {
    const result = await pool.query(
      'SELECT * FROM "SolicitudEdicion" WHERE estado = $1 ORDER BY created_at ASC',
      ['pendiente']
    );
    return result.rows;
  }

  /** Solicitud aprobada y todavia no usada para editar, para un registro puntual. */
  static async findAprobadaPendiente(usuario_id, tabla, registro_id) {
    const result = await pool.query(
      'SELECT * FROM "SolicitudEdicion" WHERE usuario_id = $1 AND tabla = $2 AND registro_id = $3 AND estado = $4 ORDER BY created_at DESC LIMIT 1',
      [usuario_id, tabla, registro_id, 'aprobada']
    );
    return result.rows[0];
  }

  static async marcarEstado(id, estado, admin_id = null) {
    const result = await pool.query(
      'UPDATE "SolicitudEdicion" SET estado = $1, admin_id = $2, resolved_at = NOW() WHERE id = $3 RETURNING *',
      [estado, admin_id, id]
    );
    return result.rows[0];
  }

  /** Consume la aprobacion: una vez usada para editar, no sirve para editar de nuevo. */
  static async marcarCompletada(id) {
    const result = await pool.query(
      'UPDATE "SolicitudEdicion" SET estado = $1 WHERE id = $2 RETURNING *',
      ['completada', id]
    );
    return result.rows[0];
  }
}

module.exports = SolicitudEdicion;
