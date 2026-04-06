const pool = require('../config/db');

class ControlPesado {
  static async findAll() {
    try {      const result = await pool.query('SELECT * FROM "ControlPesado" ORDER BY created_at DESC');      return result.rows;
    } catch (error) {      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "ControlPesado" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(controlPesadoData) {
    const { 
      producto, 
      materiaPrima, 
      loteMateriaPrima,
      peso, 
      fecha, 
      observaciones,
      responsable,
      usuario_id
    } = controlPesadoData;
    
    const result = await pool.query(
      'INSERT INTO "ControlPesado" (producto, materiaprima, lotemateriaprima, peso, fecha, observaciones, responsable, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [producto, materiaPrima, loteMateriaPrima, peso, fecha, observaciones, responsable, usuario_id]
    );
    return result.rows[0];
  }

  static async update(id, controlPesadoData) {
    const { 
      producto, 
      materiaPrima, 
      loteMateriaPrima,
      peso, 
      fecha, 
      observaciones 
    } = controlPesadoData;
    
    const result = await pool.query(
      'UPDATE "ControlPesado" SET producto = $1, materiaprima = $2, lotemateriaprima = $3, peso = $4, fecha = $5, observaciones = $6 WHERE id = $7 RETURNING *',
      [producto, materiaPrima, loteMateriaPrima, peso, fecha, observaciones, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "ControlPesado" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByProducto(producto) {
    const result = await pool.query('SELECT * FROM "ControlPesado" WHERE producto ILIKE $1', [`%${producto}%`]);
    return result.rows;
  }

  static async findByMateriaPrima(materiaPrima) {
    const result = await pool.query('SELECT * FROM "ControlPesado" WHERE materiaprima ILIKE $1', [`%${materiaPrima}%`]);
    return result.rows;
  }

  static async findByFecha(fecha) {
    const result = await pool.query('SELECT * FROM "ControlPesado" WHERE fecha = $1', [fecha]);
    return result.rows;
  }

  static async findByFechaRange(fechaInicio, fechaFin) {
    const result = await pool.query(
      'SELECT * FROM "ControlPesado" WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC',
      [fechaInicio, fechaFin]
    );
    return result.rows;
  }

  static async findByPesoRange(pesoMin, pesoMax) {
    const result = await pool.query(
      'SELECT * FROM "ControlPesado" WHERE peso BETWEEN $1 AND $2 ORDER BY peso DESC',
      [pesoMin, pesoMax]
    );
    return result.rows;
  }

  static async getEstadisticasPesado() {
    const result = await pool.query(`
      SELECT 
        producto,
        materiaprima,
        COUNT(*) as total_pesajes,
        AVG(peso) as promedio_peso,
        MIN(peso) as peso_minimo,
        MAX(peso) as peso_maximo,
        SUM(peso) as peso_total
      FROM "ControlPesado" 
      GROUP BY producto, materiaprima
      ORDER BY producto, materiaprima
    `);
    return result.rows;
  }

  static async getPesajesPorFecha() {
    const result = await pool.query(`
      SELECT 
        fecha,
        COUNT(*) as total_pesajes,
        AVG(peso) as promedio_peso,
        SUM(peso) as peso_total
      FROM "ControlPesado" 
      GROUP BY fecha
      ORDER BY fecha DESC
    `);
    return result.rows;
  }

  static async getPesajesPorProducto() {
    const result = await pool.query(`
      SELECT 
        producto,
        COUNT(*) as total_pesajes,
        AVG(peso) as promedio_peso,
        SUM(peso) as peso_total
      FROM "ControlPesado" 
      GROUP BY producto
      ORDER BY peso_total DESC
    `);
    return result.rows;
  }
}

module.exports = ControlPesado; 