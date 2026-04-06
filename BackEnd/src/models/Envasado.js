const pool = require('../config/db');

class Envasado {
  static async findAll() {
    try {      const result = await pool.query('SELECT * FROM "Envasado" ORDER BY created_at DESC');      
      // Log simple de confirmación
      if (result.rows.length > 0) {      } else {      }
      
      return result.rows;
    } catch (error) {      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "Envasado" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(envasadoData) {
    const { 
      loteProd, 
      loteEnvasado, 
      producto, 
      cantEnvases, 
      cantDescarte, 
      fechaIngresoPackaging,
      fechaElaboracion,
      observaciones,
      responsable,
      usuario_id
    } = envasadoData;
    
    const result = await pool.query(
      'INSERT INTO "Envasado" (loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, fechaIngresoPackaging, fechaElaboracion, observaciones, responsable, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, fechaIngresoPackaging, fechaElaboracion, observaciones, responsable, usuario_id]
    );
    return result.rows[0];
  }

  static async update(id, envasadoData) {
    const { 
      loteProd, 
      loteEnvasado, 
      producto, 
      cantEnvases, 
      cantDescarte, 
      fechaIngresoPackaging,
      fechaElaboracion,
      observaciones 
    } = envasadoData;
    
    const result = await pool.query(
      'UPDATE "Envasado" SET loteProd = $1, loteEnvasado = $2, producto = $3, cantEnvases = $4, cantDescarte = $5, fechaIngresoPackaging = $6, fechaElaboracion = $7, observaciones = $8 WHERE id = $9 RETURNING *',
      [loteProd, loteEnvasado, producto, cantEnvases, cantDescarte, fechaIngresoPackaging, fechaElaboracion, observaciones, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "Envasado" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByProducto(producto) {
    const result = await pool.query('SELECT * FROM "Envasado" WHERE producto ILIKE $1', [`%${producto}%`]);
    return result.rows;
  }

  static async findByLoteProd(loteProd) {
    const result = await pool.query('SELECT * FROM "Envasado" WHERE loteProd = $1', [loteProd]);
    return result.rows;
  }

  static async findByLoteEnvasado(loteEnvasado) {
    const result = await pool.query('SELECT * FROM "Envasado" WHERE loteEnvasado = $1', [loteEnvasado]);
    return result.rows;
  }

  static async findByCantEnvasesRange(cantMin, cantMax) {
    const result = await pool.query(
      'SELECT * FROM "Envasado" WHERE cantEnvases BETWEEN $1 AND $2 ORDER BY cantEnvases DESC',
      [cantMin, cantMax]
    );
    return result.rows;
  }

  static async findByCantDescarteRange(descarteMin, descarteMax) {
    const result = await pool.query(
      'SELECT * FROM "Envasado" WHERE cantDescarte BETWEEN $1 AND $2 ORDER BY cantDescarte DESC',
      [descarteMin, descarteMax]
    );
    return result.rows;
  }

  static async getEstadisticasEnvasado() {
    const result = await pool.query(`
      SELECT 
        producto,
        COUNT(*) as total_envasados,
        AVG(cantEnvases) as promedio_envases,
        SUM(cantEnvases) as total_envases,
        AVG(cantDescarte) as promedio_descarte,
        SUM(cantDescarte) as total_descarte
      FROM "Envasado" 
      GROUP BY producto
      ORDER BY total_envases DESC
    `);
    return result.rows;
  }

  static async getEnvasadosPorLote() {
    const result = await pool.query(`
      SELECT 
        loteProd,
        loteEnvasado,
        producto,
        cantEnvases,
        cantDescarte
      FROM "Envasado" 
      ORDER BY loteProd, loteEnvasado
    `);
    return result.rows;
  }
}

module.exports = Envasado; 