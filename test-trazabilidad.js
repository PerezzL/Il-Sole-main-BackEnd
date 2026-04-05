// Script simple para probar la trazabilidad
require('dotenv').config();
const Trazabilidad = require('./src/models/Trazabilidad');

async function testTrazabilidad() {
  try {
    console.log('🔍 Probando trazabilidad...');
    
    // Probar con expendio ID 1 (si existe)
    const resultado = await Trazabilidad.getCompleteTrace(1, 'expendio');
    
    console.log('✅ Trazabilidad exitosa:');
    console.log('- Registros de Recepción:', resultado.recepcion.length);
    console.log('- Registros de Pesado:', resultado.pesado.length);
    console.log('- Registros de Producción:', resultado.produccion.length);
    console.log('- Registros de Envasado:', resultado.envasado.length);
    console.log('- Registros de Expendio:', resultado.expendio.length);
    console.log('- Total registros:', resultado.resumen.totalRegistros);
    console.log('- Estado:', resultado.resumen.completitud);
    
    if (resultado.resumen.warnings.length > 0) {
      console.log('⚠️ Advertencias:');
      resultado.resumen.warnings.forEach(w => console.log('  -', w));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }
  
  process.exit(0);
}

testTrazabilidad();
