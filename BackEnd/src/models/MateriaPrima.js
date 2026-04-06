const pool = require('../config/db');

class MateriaPrima {
  static async findAll() {
    const result = await pool.query('SELECT id, nombre FROM "MateriaPrima" ORDER BY nombre');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "MateriaPrima" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(materiaPrimaData) {
    const { nombre, activo = true } = materiaPrimaData;
    const result = await pool.query(
      'INSERT INTO "MateriaPrima" (nombre, activo) VALUES ($1, $2) RETURNING *',
      [nombre, activo]
    );
    return result.rows[0];
  }

  static async update(id, materiaPrimaData) {
    const { nombre, activo } = materiaPrimaData;
    const result = await pool.query(
      'UPDATE "MateriaPrima" SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *',
      [nombre, activo, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "MateriaPrima" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByNombre(nombre) {
    const result = await pool.query('SELECT * FROM "MateriaPrima" WHERE nombre ILIKE $1', [`%${nombre}%`]);
    return result.rows;
  }

  // Método removido ya que no existe el campo categoria
  // static async findByCategoria(categoria) {
  //   const result = await pool.query('SELECT * FROM "MateriaPrima" WHERE categoria = $1', [categoria]);
  //   return result.rows;
  // }

  static async findActive() {
    const result = await pool.query('SELECT DISTINCT id, nombre FROM "MateriaPrima" WHERE activo = true ORDER BY nombre');
    return result.rows;
  }

  // Método específico para dropdowns - solo trae id y nombre únicos
  static async findActiveForDropdown() {
    try {      const result = await pool.query('SELECT DISTINCT id, nombre FROM "MateriaPrima" WHERE activo = true ORDER BY nombre');      return result.rows;
    } catch (error) {      throw error;
    }
  }
}

module.exports = MateriaPrima; 