const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function setupSemielaborado() {
  try {
    console.log('🔧 Configurando tabla Semielaborado...\n');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/add_semielaborado_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    console.log('📝 Ejecutando script SQL...');
    await pool.query(sql);
    
    console.log('✅ Tabla Semielaborado creada exitosamente');
    console.log('✅ Índices creados');
    console.log('✅ Trigger configurado\n');
    
    // Verificar que la tabla existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Semielaborado'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Verificación: Tabla Semielaborado existe en la base de datos');
      
      // Mostrar estructura de la tabla
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'Semielaborado' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estructura de la tabla:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[NULL]' : '[NOT NULL]'}`);
      });
    } else {
      console.log('❌ Error: La tabla no se creó correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error configurando Semielaborado:', error);
    if (error.code === '42P07') {
      console.log('ℹ️  La tabla ya existe, esto es normal si ya se ejecutó antes');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
setupSemielaborado();
