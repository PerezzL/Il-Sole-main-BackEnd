const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function addAuditColumns() {
  try {
    console.log('🔧 Agregando columnas de auditoría a las tablas...');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '../database/add_audit_columns.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el script SQL
    await pool.query(sqlScript);
    
    console.log('✅ Columnas de auditoría agregadas exitosamente');
    console.log('📋 Columnas agregadas:');
    console.log('   - responsable: nombre del usuario que creó el registro');
    console.log('   - usuario_id: ID del usuario para referencia');
    console.log('   - Índices creados para mejorar el rendimiento');
    
    // Verificar las columnas agregadas
    const tables = ['Recepcion', 'Produccion', 'Envasado', 'ControlPesado', 'Expendio'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name IN ('responsable', 'usuario_id')
        ORDER BY column_name
      `, [table]);
      
      console.log(`\n🔍 Tabla "${table}":`);
      if (result.rows.length > 0) {
        result.rows.forEach(col => {
          console.log(`   ✅ ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('   ⚠️ No se encontraron columnas de auditoría');
      }
    }
    
  } catch (error) {
    console.error('❌ Error agregando columnas de auditoría:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
addAuditColumns(); 