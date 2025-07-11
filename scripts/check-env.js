require('dotenv').config();

console.log('🔍 Verificando variables de entorno...\n');

console.log('📋 DATABASE_URL actual:');
console.log(process.env.DATABASE_URL || '❌ No definida');

console.log('\n📋 POSTGRES_URL_NON_POOLING:');
console.log(process.env.POSTGRES_URL_NON_POOLING || '❌ No definida');

console.log('\n📋 POSTGRES_URL:');
console.log(process.env.POSTGRES_URL || '❌ No definida');

console.log('\n🔧 Verificando si hay variables del sistema que sobrescriban:');
console.log('DATABASE_URL en process.env:', !!process.env.DATABASE_URL);
console.log('Tipo de DATABASE_URL:', typeof process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  console.log('\n📝 Análisis de la URL:');
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('  - Protocolo:', url.protocol);
    console.log('  - Usuario:', url.username);
    console.log('  - Host:', url.hostname);
    console.log('  - Puerto:', url.port);
    console.log('  - Base de datos:', url.pathname.slice(1));
  } catch (error) {
    console.log('  - Error al parsear URL:', error.message);
  }
} 