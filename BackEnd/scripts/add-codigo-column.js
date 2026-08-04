const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function addCodigoColumn() {
  try {
    console.log('🔧 Agregando columna "codigo" a las tablas de formularios...');

    const sqlFilePath = path.join(__dirname, '../database/add_codigo_column.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sqlScript);

    console.log('✅ Columna "codigo" agregada exitosamente');

    const tables = ['Recepcion', 'Produccion', 'Envasado', 'ControlPesado', 'Expendio', 'Semielaborado'];

    for (const table of tables) {
      const result = await pool.query(
        `SELECT column_name, data_type
         FROM information_schema.columns
         WHERE table_name = $1 AND column_name = 'codigo'`,
        [table]
      );

      console.log(`🔍 Tabla "${table}":`, result.rows.length > 0 ? '✅ codigo presente' : '⚠️ no encontrada');
    }
  } catch (error) {
    console.error('❌ Error agregando columna "codigo":', error);
  } finally {
    await pool.end();
  }
}

addCodigoColumn();
