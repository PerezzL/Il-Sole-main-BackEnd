const pool = require('../config/db');

class Produccion {
  static async findAll() {
    const result = await pool.query('SELECT * FROM Produccion');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Produccion WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(produccionData) {
    const { 
      producto, 
      materiaPrima, 
      lote, 
      planProduccion, 
      produccion, 
      pesoDescarte, 
      observaciones, 
      comentarios 
    } = produccionData;
    
    const result = await pool.query(
      'INSERT INTO Produccion (producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios]
    );
    return result.rows[0];
  }

  static async update(id, produccionData) {
    const { 
      producto, 
      materiaPrima, 
      lote, 
      planProduccion, 
      produccion, 
      pesoDescarte, 
      observaciones, 
      comentarios 
    } = produccionData;
    
    const result = await pool.query(
      'UPDATE Produccion SET producto = $1, materiaPrima = $2, lote = $3, planProduccion = $4, produccion = $5, pesoDescarte = $6, observaciones = $7, comentarios = $8 WHERE id = $9 RETURNING *',
      [producto, materiaPrima, lote, planProduccion, produccion, pesoDescarte, observaciones, comentarios, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Produccion WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByProducto(producto) {
    const result = await pool.query('SELECT * FROM Produccion WHERE producto ILIKE $1', [`%${producto}%`]);
    return result.rows;
  }

  static async findByMateriaPrima(materiaPrima) {
    const result = await pool.query('SELECT * FROM Produccion WHERE materiaPrima ILIKE $1', [`%${materiaPrima}%`]);
    return result.rows;
  }

  static async findByLote(lote) {
    const result = await pool.query('SELECT * FROM Produccion WHERE lote = $1', [lote]);
    return result.rows;
  }

  static async findByPlanProduccion(planProduccion) {
    const result = await pool.query('SELECT * FROM Produccion WHERE planProduccion = $1', [planProduccion]);
    return result.rows;
  }

  static async findByProduccionRange(produccionMin, produccionMax) {
    const result = await pool.query(
      'SELECT * FROM Produccion WHERE produccion BETWEEN $1 AND $2 ORDER BY produccion DESC',
      [produccionMin, produccionMax]
    );
    return result.rows;
  }

  static async findByPesoDescarteRange(pesoMin, pesoMax) {
    const result = await pool.query(
      'SELECT * FROM Produccion WHERE pesoDescarte BETWEEN $1 AND $2 ORDER BY pesoDescarte DESC',
      [pesoMin, pesoMax]
    );
    return result.rows;
  }

  static async getEstadisticasProduccion() {
    const result = await pool.query(`
      SELECT 
        producto,
        COUNT(*) as total_producciones,
        AVG(produccion) as promedio_produccion,
        SUM(produccion) as total_produccion,
        AVG(pesoDescarte) as promedio_descarte,
        SUM(pesoDescarte) as total_descarte
      FROM Produccion 
      GROUP BY producto
      ORDER BY total_produccion DESC
    `);
    return result.rows;
  }
}

module.exports = Produccion; 