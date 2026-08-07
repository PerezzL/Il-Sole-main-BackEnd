const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function addSolicitudEdicionTable() {
  try {
    console.log('🔧 Creando tabla "SolicitudEdicion"...');

    const sqlFilePath = path.join(__dirname, '../database/add_solicitud_edicion_table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sqlScript);

    console.log('✅ Tabla "SolicitudEdicion" lista');

    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'SolicitudEdicion' ORDER BY ordinal_position`
    );
    result.rows.forEach((col) => console.log(`   - ${col.column_name} (${col.data_type})`));
  } catch (error) {
    console.error('❌ Error creando tabla "SolicitudEdicion":', error);
  } finally {
    await pool.end();
  }
}

addSolicitudEdicionTable();
