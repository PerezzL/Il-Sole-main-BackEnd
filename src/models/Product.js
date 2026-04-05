const pool = require('../config/db');

class Product {
  static async findAll() {
    const result = await pool.query('SELECT id, name FROM "Product" ORDER BY name');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "Product" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(productData) {
    const { name } = productData;
    const result = await pool.query(
      'INSERT INTO "Product" (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  }

  static async update(id, productData) {
    const { name } = productData;
    const result = await pool.query(
      'UPDATE "Product" SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "Product" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const result = await pool.query('SELECT * FROM "Product" WHERE name ILIKE $1', [`%${name}%`]);
    return result.rows;
  }

  // Método removido ya que no existe el campo description
  // static async findByDescription(description) {
  //   const result = await pool.query('SELECT * FROM "Product" WHERE description ILIKE $1', [`%${description}%`]);
  //   return result.rows;
  // }

  // Método específico para dropdowns - solo trae id y nombre únicos
  static async findForDropdown() {
    try {      const result = await pool.query('SELECT DISTINCT id, name FROM "Product" ORDER BY name');      return result.rows;
    } catch (error) {      throw error;
    }
  }
}

module.exports = Product; 