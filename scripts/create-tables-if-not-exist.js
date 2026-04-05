const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function createTablesIfNotExist() {
  try {
    console.log('🔧 Creando tablas si no existen...\n');

    // Leer el esquema SQL
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el esquema
    await pool.query(schema);
    console.log('✅ Esquema ejecutado correctamente');

    // Verificar que las tablas se crearon
    const tables = [
      'Recepcion',
      'Produccion', 
      'Envasado',
      'ControlPesado',
      'Expendio'
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = result.rows[0].count;
        console.log(`✅ Tabla "${table}" existe con ${count} registros`);
      } catch (error) {
        console.log(`❌ Error verificando tabla "${table}":`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    await pool.end();
  }
}

createTablesIfNotExist(); 