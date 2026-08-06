const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function addNotificacionTable() {
  try {
    console.log('🔧 Creando tabla "Notificacion"...');

    const sqlFilePath = path.join(__dirname, '../database/add_notificacion_table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sqlScript);

    console.log('✅ Tabla "Notificacion" lista');

    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Notificacion' ORDER BY ordinal_position`
    );
    result.rows.forEach((col) => console.log(`   - ${col.column_name} (${col.data_type})`));
  } catch (error) {
    console.error('❌ Error creando tabla "Notificacion":', error);
  } finally {
    await pool.end();
  }
}

addNotificacionTable();
