const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    try {      const result = await pool.query('SELECT * FROM "User"');      return result.rows;
    } catch (error) {      throw error;
    }
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(userData) {
    const { username, password, email, role = 'user' } = userData;
    
    // Hash de la contraseña antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Usuario creándose
    const result = await pool.query(
      'INSERT INTO "User" (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, hashedPassword, email, role]
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const { username, password, email, role } = userData;
    const result = await pool.query(
      'UPDATE "User" SET username = $1, password = $2, email = $3, role = $4 WHERE id = $5 RETURNING *',
      [username, password, email, role, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM "User" WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    try {      const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);      return result.rows[0];
    } catch (error) {      throw error;
    }
  }

  static async findByRole(role) {
    const result = await pool.query('SELECT * FROM "User" WHERE role = $1', [role]);
    return result.rows;
  }

  static async findAdmins() {
    const result = await pool.query('SELECT * FROM "User" WHERE role = $1', ['admin']);
    return result.rows;
  }

  static async findNormalUsers() {
    const result = await pool.query('SELECT * FROM "User" WHERE role = $1', ['user']);
    return result.rows;
  }

  static async updateRole(id, role) {
    const result = await pool.query(
      'UPDATE "User" SET role = $1 WHERE id = $2 RETURNING *',
      [role, id]
    );
    return result.rows[0];
  }
}

module.exports = User; 