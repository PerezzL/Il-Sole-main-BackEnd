const pool = require('../config/db');

class Recepcion {
  static async findAll() {
    const result = await pool.query('SELECT * FROM Recepcion');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(recepcionData) {
    const { 
      materiaPrima, 
      control1, 
      control2, 
      control3, 
      marca, 
      proveedor, 
      cant, 
      nroRemito, 
      temp, 
      fechaElaborado, 
      fechaVTO, 
      lote 
    } = recepcionData;
    
    const result = await pool.query(
      'INSERT INTO Recepcion (materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote]
    );
    return result.rows[0];
  }

  static async update(id, recepcionData) {
    const { 
      materiaPrima, 
      control1, 
      control2, 
      control3, 
      marca, 
      proveedor, 
      cant, 
      nroRemito, 
      temp, 
      fechaElaborado, 
      fechaVTO, 
      lote 
    } = recepcionData;
    
    const result = await pool.query(
      'UPDATE Recepcion SET materiaPrima = $1, control1 = $2, control2 = $3, control3 = $4, marca = $5, proveedor = $6, cant = $7, nroRemito = $8, temp = $9, fechaElaborado = $10, fechaVTO = $11, lote = $12 WHERE id = $13 RETURNING *',
      [materiaPrima, control1, control2, control3, marca, proveedor, cant, nroRemito, temp, fechaElaborado, fechaVTO, lote, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Recepcion WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByMateriaPrima(materiaPrima) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE materiaPrima ILIKE $1', [`%${materiaPrima}%`]);
    return result.rows;
  }

  static async findByProveedor(proveedor) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE proveedor ILIKE $1', [`%${proveedor}%`]);
    return result.rows;
  }

  static async findByLote(lote) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE lote = $1', [lote]);
    return result.rows;
  }

  static async findByNroRemito(nroRemito) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE nroRemito = $1', [nroRemito]);
    return result.rows;
  }

  static async findByFechaRange(fechaInicio, fechaFin) {
    const result = await pool.query(
      'SELECT * FROM Recepcion WHERE fechaElaborado BETWEEN $1 AND $2 ORDER BY fechaElaborado DESC',
      [fechaInicio, fechaFin]
    );
    return result.rows;
  }

  static async findByFechaVTO(fechaVTO) {
    const result = await pool.query('SELECT * FROM Recepcion WHERE fechaVTO = $1', [fechaVTO]);
    return result.rows;
  }
}

module.exports = Recepcion; 