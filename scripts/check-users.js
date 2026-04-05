const pool = require('../src/config/db');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    // Obtener todos los usuarios
    const result = await pool.query('SELECT id, username, email, role FROM "User" ORDER BY id');
    const users = result.rows;
    
    if (users.length === 0) {
      console.log('⚠️ No se encontraron usuarios en la base de datos');
      console.log('💡 Agrega usuarios a la tabla "User" para poder hacer login');
      return;
    }
    
    console.log(`📋 Encontrados ${users.length} usuarios:`);
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Usuario: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log('─'.repeat(80));
    });
    
    console.log('\n✅ Usuarios listos para autenticación');
    console.log('💡 Usa cualquiera de estos emails y contraseñas para hacer login');
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
checkUsers(); 