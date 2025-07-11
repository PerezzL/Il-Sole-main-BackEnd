const fs = require('fs');
const path = require('path');
const sql = require('../src/config/db');

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos Supabase...');
    
    // Leer el archivo SQL del esquema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Leyendo esquema de base de datos...');
    
    // Dividir el SQL en comandos individuales
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await sql.unsafe(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado correctamente`);
        } catch (error) {
          // Ignorar errores de "ya existe" para tablas e índices
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Comando ${i + 1}/${commands.length} ya existe (ignorado)`);
          } else {
            console.error(`❌ Error en comando ${i + 1}/${commands.length}:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Configuración de base de datos completada exitosamente!');
    
    // Verificar que las tablas se crearon correctamente
    console.log('\n📊 Verificando tablas creadas...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('📋 Tablas disponibles:');
    tablesResult.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    await sql.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 