const pool = require('../config/db');

class Product {
  static async findAll() {
    const result = await pool.query('SELECT * FROM Product');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM Product WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(productData) {
    const { name, description } = productData;
    const result = await pool.query(
      'INSERT INTO Product (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  static async update(id, productData) {
    const { name, description } = productData;
    const result = await pool.query(
      'UPDATE Product SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Product WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const result = await pool.query('SELECT * FROM Product WHERE name ILIKE $1', [`%${name}%`]);
    return result.rows;
  }

  static async findByDescription(description) {
    const result = await pool.query('SELECT * FROM Product WHERE description ILIKE $1', [`%${description}%`]);
    return result.rows;
  }
}

module.exports = Product; 