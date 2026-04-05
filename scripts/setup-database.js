const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Configurando base de datos...');
    
    // Leer el archivo de esquema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Ejecutando esquema de base de datos...');
    
    // Dividir el esquema en comandos individuales para mejor manejo de errores
    const commands = schemaSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await pool.query(command);
        } catch (error) {
          // Ignorar errores de elementos que ya existen
          if (error.code === '42710' || error.code === '42P07') {
            console.log(`⚠️  Elemento ya existe: ${error.message.split('"')[1] || 'N/A'}`);
          } else {
            console.log(`⚠️  Error ejecutando comando: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Esquema de base de datos procesado');
    
    // Verificar que las tablas se crearon
    console.log('\n🔍 Verificando tablas creadas...');
    
    const tables = [
      'User',
      'Product', 
      'Recepcion',
      'Produccion',
      'Envasado',
      'ControlPesado',
      'Expendio'
    ];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        if (result.rows[0].exists) {
          console.log(`✅ Tabla "${table}" existe`);
          
          // Contar registros en la tabla
          const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
          console.log(`   - Registros: ${countResult.rows[0].count}`);
        } else {
          console.log(`❌ Tabla "${table}" NO existe`);
        }
      } catch (error) {
        console.log(`❌ Error verificando tabla "${table}": ${error.message}`);
      }
    }
    
    console.log('\n🎉 Configuración de base de datos completada');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar la configuración
setupDatabase(); 