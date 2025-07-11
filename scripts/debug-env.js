require('dotenv').config();
const { Pool } = require('pg');

async function debugEnvironment() {
  console.log('🔍 Debugging variables de entorno...\n');

  // Verificar variables de entorno
  const envVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'POSTGRES_URL_NON_POOLING': process.env.POSTGRES_URL_NON_POOLING,
    'POSTGRES_USER': process.env.POSTGRES_USER,
    'POSTGRES_HOST': process.env.POSTGRES_HOST,
    'POSTGRES_PASSWORD': process.env.POSTGRES_PASSWORD,
    'POSTGRES_DATABASE': process.env.POSTGRES_DATABASE
  };

  console.log('📋 Variables de entorno:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`  ✅ ${key}: ${typeof value} - ${value.substring(0, 50)}...`);
    } else {
      console.log(`  ❌ ${key}: No definida`);
    }
  });

  console.log('\n🔧 Probando diferentes configuraciones...\n');

  // Configuración 1: Usando POSTGRES_URL_NON_POOLING
  console.log('1️⃣ Probando con POSTGRES_URL_NON_POOLING...');
  try {
    const pool1 = new Pool({
      connectionString: process.env.POSTGRES_URL_NON_POOLING
    });
    
    const result1 = await pool1.query('SELECT NOW()');
    console.log('✅ Configuración 1 exitosa!');
    await pool1.end();
  } catch (error) {
    console.log('❌ Configuración 1 falló:', error.message);
  }

  // Configuración 2: Usando parámetros individuales
  console.log('\n2️⃣ Probando con parámetros individuales...');
  try {
    const pool2 = new Pool({
      host: process.env.POSTGRES_HOST,
      port: 5432,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const result2 = await pool2.query('SELECT NOW()');
    console.log('✅ Configuración 2 exitosa!');
    await pool2.end();
  } catch (error) {
    console.log('❌ Configuración 2 falló:', error.message);
  }

  // Configuración 3: Usando DATABASE_URL
  console.log('\n3️⃣ Probando con DATABASE_URL...');
  try {
    const pool3 = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    const result3 = await pool3.query('SELECT NOW()');
    console.log('✅ Configuración 3 exitosa!');
    await pool3.end();
  } catch (error) {
    console.log('❌ Configuración 3 falló:', error.message);
  }

  console.log('\n🎯 Recomendación:');
  console.log('Usa la configuración que funcionó para actualizar src/config/db.js');
}

// Ejecutar la función
debugEnvironment().catch(console.error); 