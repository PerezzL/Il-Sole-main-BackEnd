const pool = require('../config/db');

class Notificacion {
  static async create({ usuario_id, tipo, mensaje, tabla, codigo }) {
    const result = await pool.query(
      'INSERT INTO "Notificacion" (usuario_id, tipo, mensaje, tabla, codigo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [usuario_id, tipo, mensaje, tabla, codigo]
    );
    return result.rows[0];
  }

  static async findByUsuario(usuario_id, { limit = 50 } = {}) {
    const result = await pool.query(
      'SELECT * FROM "Notificacion" WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT $2',
      [usuario_id, limit]
    );
    return result.rows;
  }

  static async countNoLeidas(usuario_id) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM "Notificacion" WHERE usuario_id = $1 AND leido = false',
      [usuario_id]
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async marcarLeida(id, usuario_id) {
    const result = await pool.query(
      'UPDATE "Notificacion" SET leido = true WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuario_id]
    );
    return result.rows[0];
  }

  static async marcarTodasLeidas(usuario_id) {
    await pool.query(
      'UPDATE "Notificacion" SET leido = true WHERE usuario_id = $1 AND leido = false',
      [usuario_id]
    );
  }
}

module.exports = Notificacion;
