const pool = require('../config/db');

class Expendio {
  static async findAll() {
    const result = await pool.query('SELECT * FROM Expendio');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Expendio WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(expendioData) {
    const { 
      producto, 
      lote, 
      destino, 
      tempTransporte, 
      LimpTransporte, 
      responsable 
    } = expendioData;
    
    const result = await pool.query(
      'INSERT INTO Expendio (producto, lote, destino, tempTransporte, LimpTransporte, responsable) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [producto, lote, destino, tempTransporte, LimpTransporte, responsable]
    );
    return result.rows[0];
  }

  static async update(id, expendioData) {
    const { 
      producto, 
      lote, 
      destino, 
      tempTransporte, 
      LimpTransporte, 
      responsable 
    } = expendioData;
    
    const result = await pool.query(
      'UPDATE Expendio SET producto = $1, lote = $2, destino = $3, tempTransporte = $4, LimpTransporte = $5, responsable = $6 WHERE id = $7 RETURNING *',
      [producto, lote, destino, tempTransporte, LimpTransporte, responsable, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Expendio WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByProducto(producto) {
    const result = await pool.query('SELECT * FROM Expendio WHERE producto ILIKE $1', [`%${producto}%`]);
    return result.rows;
  }

  static async findByLote(lote) {
    const result = await pool.query('SELECT * FROM Expendio WHERE lote = $1', [lote]);
    return result.rows;
  }

  static async findByDestino(destino) {
    const result = await pool.query('SELECT * FROM Expendio WHERE destino ILIKE $1', [`%${destino}%`]);
    return result.rows;
  }

  static async findByResponsable(responsable) {
    const result = await pool.query('SELECT * FROM Expendio WHERE responsable ILIKE $1', [`%${responsable}%`]);
    return result.rows;
  }

  static async findByTempTransporteRange(tempMin, tempMax) {
    const result = await pool.query(
      'SELECT * FROM Expendio WHERE tempTransporte BETWEEN $1 AND $2 ORDER BY tempTransporte',
      [tempMin, tempMax]
    );
    return result.rows;
  }

  static async findByLimpTransporte(limpTransporte) {
    const result = await pool.query('SELECT * FROM Expendio WHERE LimpTransporte = $1', [limpTransporte]);
    return result.rows;
  }

  static async getEstadisticasExpendio() {
    const result = await pool.query(`
      SELECT 
        producto,
        destino,
        COUNT(*) as total_expendios,
        AVG(tempTransporte) as promedio_temperatura
      FROM Expendio 
      GROUP BY producto, destino
      ORDER BY producto, destino
    `);
    return result.rows;
  }

  static async getExpendiosPorDestino() {
    const result = await pool.query(`
      SELECT 
        destino,
        COUNT(*) as total_expendios,
        COUNT(DISTINCT producto) as productos_diferentes,
        COUNT(DISTINCT lote) as lotes_diferentes
      FROM Expendio 
      GROUP BY destino
      ORDER BY total_expendios DESC
    `);
    return result.rows;
  }

  static async getExpendiosPorResponsable() {
    const result = await pool.query(`
      SELECT 
        responsable,
        COUNT(*) as total_expendios,
        COUNT(DISTINCT producto) as productos_diferentes,
        COUNT(DISTINCT destino) as destinos_diferentes
      FROM Expendio 
      GROUP BY responsable
      ORDER BY total_expendios DESC
    `);
    return result.rows;
  }

  static async getExpendiosPorLote() {
    const result = await pool.query(`
      SELECT 
        lote,
        producto,
        COUNT(*) as total_expendios,
        COUNT(DISTINCT destino) as destinos_diferentes
      FROM Expendio 
      GROUP BY lote, producto
      ORDER BY lote
    `);
    return result.rows;
  }
}

module.exports = Expendio; 