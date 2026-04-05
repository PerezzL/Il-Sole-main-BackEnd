const pool = require('../config/db');

// Controlador de Materia Prima - Usa tabla Product como alternativa

// Obtener todas las materias primas
exports.getAllMateriasPrimas = async (req, res) => {
  try {    const result = await pool.query('SELECT id, nombre FROM "MateriaPrima" ORDER BY nombre');    res.json(result.rows);
  } catch (err) {    // En lugar de error 500, retornar array vacío
    res.json([]);
  }
};

// Obtener solo las materias primas activas (para dropdowns)
exports.getActiveMateriasPrimas = async (req, res) => {
  try {    const result = await pool.query('SELECT id, name as nombre FROM "Product" ORDER BY name');    res.json(result.rows);
  } catch (err) {    // En lugar de error 500, retornar array vacío
    res.json([]);
  }
};

// Obtener materia prima por ID
exports.getMateriaPrimaById = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name as nombre, description as descripcion FROM "Product" WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {    res.json({ error: 'Error al obtener la materia prima' });
  }
};

// Crear nueva materia prima
exports.createMateriaPrima = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query(
      'INSERT INTO "Product" (name, description) VALUES ($1, $2) RETURNING id, name as nombre, description as descripcion',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {    res.json({ error: 'Error al crear la materia prima' });
  }
};

// Actualizar materia prima
exports.updateMateriaPrima = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query(
      'UPDATE "Product" SET name = $1, description = $2 WHERE id = $3 RETURNING id, name as nombre, description as descripcion',
      [nombre, descripcion, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {    res.json({ error: 'Error al actualizar la materia prima' });
  }
};

// Eliminar materia prima
exports.deleteMateriaPrima = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM "Product" WHERE id = $1 RETURNING id, name as nombre', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json({ message: 'Materia prima eliminada correctamente' });
  } catch (err) {    res.json({ error: 'Error al eliminar la materia prima' });
  }
};

// Buscar materias primas por nombre
exports.searchMateriasPrimas = async (req, res) => {
  try {
    const { nombre } = req.query;
    const result = await pool.query('SELECT id, name as nombre, description as descripcion FROM "Product" WHERE name ILIKE $1', [`%${nombre}%`]);
    res.json(result.rows);
  } catch (err) {    res.json({ error: 'Error al buscar materias primas' });
  }
};

// Obtener materias primas por categoría
exports.getMateriasPrimasByCategoria = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name as nombre, description as descripcion FROM "Product" WHERE description ILIKE $1', [`%${req.params.categoria}%`]);
    res.json(result.rows);
  } catch (err) {    res.json({ error: 'Error al obtener materias primas por categoría' });
  }
};

// Endpoint de prueba para verificar la tabla
exports.testMateriaPrimaTable = async (req, res) => {
  try {    
    // Verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Product'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;    
    if (!tableExists) {
      return res.json({
        error: 'La tabla Product no existe',
        suggestion: 'Ejecuta el script de setup de base de datos'
      });
    }
    
    // Contar registros
    const countResult = await pool.query('SELECT COUNT(*) FROM "Product"');
    const count = parseInt(countResult.rows[0].count);    
    res.json({
      message: 'Tabla Product existe y es accesible',
      count: count
    });
    
  } catch (err) {    res.status(500).json({ 
      error: 'Error al probar la tabla Product', 
      details: err.message,
      stack: err.stack
    });
  }
};

// Endpoint de prueba para verificar la conexión a la base de datos
exports.testDatabaseConnection = async (req, res) => {
  try {    
    // Probar conexión simple
    const result = await pool.query('SELECT NOW() as current_time');
    const currentTime = result.rows[0].current_time;    
    // Verificar si la tabla Product existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Product'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    res.json({
      message: 'Conexión a la base de datos exitosa',
      current_time: currentTime,
      table_exists: tableExists
    });
    
  } catch (err) {    res.status(500).json({ 
      error: 'Error de conexión a la base de datos', 
      details: err.message,
      stack: err.stack,
      suggestion: 'Verifica las credenciales de Supabase y la conexión a internet'
    });
  }
}; 