const pool = require('../config/db');
const { createWithCodigo } = require('../utils/codigo');

class Semielaborado {
  static async findAll() {
    try {      const result = await pool.query('SELECT * FROM "Semielaborado" ORDER BY created_at DESC');      return result.rows;
    } catch (error) {      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "Semielaborado" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(semielaboradoData) {
    const { 
      semielaborado, 
      ingrediente, 
      loteMateriaPrima,
      lote,
      peso, 
      fecha, 
      observaciones,
      responsable,
      usuario_id
    } = semielaboradoData;
    
    return createWithCodigo('Semielaborado', 'SEMI', async (codigo) => {
      const result = await pool.query(
        'INSERT INTO "Semielaborado" (codigo, semielaborado, ingrediente, lotemateriaprima, lote, peso, fecha, observaciones, responsable, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [codigo, semielaborado, ingrediente, loteMateriaPrima, lote, peso, fecha, observaciones, responsable, usuario_id]
      );
      return result.rows[0];
    });
  }

  static async update(id, semielaboradoData) {
    const { 
      semielaborado, 
      ingrediente, 
      loteMateriaPrima,
      lote,
      peso, 
      fecha, 
      observaciones 
    } = semielaboradoData;
    
    const result = await pool.query(
      'UPDATE "Semielaborado" SET semielaborado = $1, ingrediente = $2, lotemateriaprima = $3, lote = $4, peso = $5, fecha = $6, observaciones = $7 WHERE id = $8 RETURNING *',
      [semielaborado, ingrediente, loteMateriaPrima, lote, peso, fecha, observaciones, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "Semielaborado" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findBySemielaborado(semielaborado) {
    const result = await pool.query('SELECT * FROM "Semielaborado" WHERE semielaborado ILIKE $1', [`%${semielaborado}%`]);
    return result.rows;
  }

  static async findByIngrediente(ingrediente) {
    const result = await pool.query('SELECT * FROM "Semielaborado" WHERE ingrediente ILIKE $1', [`%${ingrediente}%`]);
    return result.rows;
  }

  static async findByFecha(fecha) {
    const result = await pool.query('SELECT * FROM "Semielaborado" WHERE fecha = $1', [fecha]);
    return result.rows;
  }

  static async findByFechaRange(fechaInicio, fechaFin) {
    const result = await pool.query(
      'SELECT * FROM "Semielaborado" WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC',
      [fechaInicio, fechaFin]
    );
    return result.rows;
  }

  static async findByLote(lote) {
    const result = await pool.query('SELECT * FROM "Semielaborado" WHERE lote = $1', [lote]);
    return result.rows;
  }

  // Nombres únicos ya cargados, para el dropdown del formulario
  static async findDistinctNames() {
    const result = await pool.query(
      `SELECT DISTINCT semielaborado FROM "Semielaborado"
       WHERE semielaborado IS NOT NULL AND semielaborado <> ''
       ORDER BY semielaborado`
    );
    return result.rows.map((row) => row.semielaborado);
  }
}

module.exports = Semielaborado;
