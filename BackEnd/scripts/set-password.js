const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function setPassword() {
  try {
    // Configuración del usuario y nueva contraseña
    const email = 'lucasperezmarquez1@gmail.com'; // Cambia este email si es necesario
    const newPassword = 'admin123'; // Cambia esta contraseña por la que quieras
    
    console.log('🔧 Estableciendo nueva contraseña...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Nueva contraseña: ${newPassword}`);
    
    // Hash de la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar en la base de datos
    const result = await pool.query(
      'UPDATE "User" SET password = $1 WHERE email = $2 RETURNING username, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`✅ Contraseña actualizada exitosamente`);
      console.log(`👤 Usuario: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔐 Nueva contraseña: ${newPassword}`);
      console.log('\n🎯 Ahora puedes hacer login con:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Contraseña: ${newPassword}`);
    } else {
      console.log(`❌ Usuario con email ${email} no encontrado`);
    }
    
  } catch (error) {
    console.error('❌ Error estableciendo contraseña:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
setPassword(); 