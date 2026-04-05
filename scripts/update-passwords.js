const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function updatePasswords() {
  try {
    console.log('🔧 Actualizando contraseñas en la base de datos...');
    
    // Obtener todos los usuarios de la base de datos
    const result = await pool.query('SELECT id, username, password FROM "User"');
    const users = result.rows;
    
    if (users.length === 0) {
      console.log('⚠️ No se encontraron usuarios en la base de datos');
      return;
    }
    
    console.log(`📋 Encontrados ${users.length} usuarios para actualizar`);
    
    for (const user of users) {
      // Verificar si la contraseña ya está hasheada
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`⏭️ Contraseña ya hasheada para: ${user.username}`);
        continue;
      }
      
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      // Actualizar en la base de datos
      const updateResult = await pool.query(
        'UPDATE "User" SET password = $1 WHERE id = $2 RETURNING username',
        [hashedPassword, user.id]
      );
      
      if (updateResult.rows.length > 0) {
        console.log(`✅ Contraseña actualizada para: ${user.username}`);
      } else {
        console.log(`❌ Error actualizando contraseña para: ${user.username}`);
      }
    }
    
    console.log('✅ Proceso de actualización de contraseñas completado');
    
  } catch (error) {
    console.error('❌ Error actualizando contraseñas:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
updatePasswords(); 