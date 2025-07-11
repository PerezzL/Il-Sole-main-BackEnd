const sql = require('../src/config/db');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    
    console.log('✅ Conexión exitosa!');
    console.log(`🕐 Hora actual de la BD: ${result[0].current_time}`);
    console.log(`📊 Versión de PostgreSQL: ${result[0].db_version.split(' ')[0]}`);
    
    // Verificar variables de entorno
    console.log('\n🔧 Configuración:');
    console.log(`  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`  - POSTGRES_HOST: ${process.env.POSTGRES_HOST || 'No configurado'}`);
    console.log(`  - POSTGRES_DATABASE: ${process.env.POSTGRES_DATABASE || 'No configurado'}`);
    
    // Verificar tablas existentes
    console.log('\n📋 Verificando tablas existentes...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    if (tablesResult.length > 0) {
      console.log('📊 Tablas encontradas:');
      tablesResult.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('📝 No hay tablas creadas aún. Ejecuta el script de configuración.');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Sugerencia: Verifica que la URL de conexión sea correcta');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Sugerencia: Verifica las credenciales en el archivo .env');
    } else if (error.message.includes('SSL')) {
      console.log('💡 Sugerencia: Verifica la configuración SSL');
    }
  } finally {
    await sql.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection();
}

module.exports = testConnection; 